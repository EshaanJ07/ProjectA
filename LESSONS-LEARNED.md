# Lessons Learned

One entry per problem that has actually been fixed. Each entry records what the problem
was, what the fix turned out to be, and the single lesson worth carrying forward.

Not every entry here corresponds to an entry in `PROBLEMS.md` — some bugs were found and
fixed in the same sitting and never made it into that document.

---

## 1 — Rich-get-richer sampling loop

**Found:** 2026-07-08 · **Fixed:** 2026-07-09
**Where:** `backend/logic.py` (`update_game`, `get_next_note`), `backend/schemas.py` (`Game`)

### The problem

`Game.seen_notes` was a `list[str]`, and `update_game` appended the current note to it on
every single turn, unconditionally. Notes therefore accumulated duplicates: play `D7` six
thousand times and `D7` appeared in the list six thousand times.

`get_next_note` then sampled that list with `random.choice`, which picks a uniformly random
*index* — not a uniformly random *value*. A note occupying 6,792 of the list's positions was
6,792 times likelier to be drawn than one occupying 2. And every draw appended the note
again, which increased its share of the positions, which increased its odds on the next
draw. A closed feedback loop.

Measured after 50,000 turns of simulated play:

```
most-repeated : D7 appears 6792x in the list
least-repeated: D2 appears    2x in the list
-> D7 is 3396x likelier than D2 on a 'seen' pick

500k sampled picks (uniform would be ~5,882 each)
  D7:  27219  (11.6x uniform)
  D2:     12  ( 0.0x uniform)
```

Why this actually mattered: the game is a memory test. Its difficulty depends on the player
genuinely not knowing whether a note is new. A sampler that collapses toward a handful of
hot notes makes the game *easier* the longer it runs, which inverts the entire design. The
bug was silent — no crash, no error, correct-looking code — and would only ever have shown
up as "the game feels weirdly easy after a while."

### The solution

Split the one fact ("which notes has the player heard?") across two structures that each do
one job, and write to both from exactly one place:

```python
seen_notes: set[str]  = Field(default_factory=set)   # membership test, O(1)
seen_order: list[str] = Field(default_factory=list)  # sampling + play order
```

```python
is_new = current_game.current_note not in current_game.seen_notes
correct_ans = "new" if is_new else "seen"

# ...score / lives...

if is_new:
    current_game.seen_notes.add(current_game.current_note)
    current_game.seen_order.append(current_game.current_note)
```

`is_new` is computed **once, before either mutation**, off the set, in O(1). Because the
guard wraps both writes, `seen_order` can only ever contain distinct notes, so
`random.choice(seen_order)` is uniform over values rather than positions.

Verified after the fix:

```
500k 'seen' picks, uniform would be ~5,882 each
  hottest  As3: 6072  (1.03x uniform)
  coldest  Fs3: 5734  (0.97x uniform)
  spread = 1.06x     <- sampling noise, not bias

len(seen_notes) = 85   len(seen_order) = 85
invariant  same members  : PASS
invariant  no duplicates : PASS
```

An unplanned bonus: sampling from an insertion-ordered list instead of a set also made the
game **reproducible under a seed**. Sets iterate in hash order, and Python randomizes string
hashing per process, so `random.choice(list(some_set))` returns a different element on every
run even with `random.seed(42)`. Four runs under different `PYTHONHASHSEED` values now
produce an identical note sequence, which is what makes seeded tests possible at all.

### Biggest lesson

**Choosing a container is choosing a probability distribution.** `list` versus `set` looked
like a style question and was actually the bug: `random.choice` samples positions, so a list
with duplicates *is* a weighted distribution, and the weights were being updated by the very
function reading them. Before picking a data structure, ask what operation will read it and
what that operation assumes.

Three things learned in the process of fixing it, each of which cost a regression:

1. **One fact split across two fields needs one write path.** The moment `seen_notes` and
   `seen_order` both existed, they drifted — first because only one was deduped, later
   because a thread could interleave between the two writes. Invariants that span two
   statements get broken. Put the pair behind a single guard (or a single method), and
   assert the invariant in a test.

2. **Compute a predicate before you mutate what it depends on.** One attempted fix checked
   `current_note not in seen_notes` *after* `.add()` had already put it there, making the
   condition permanently false and leaving `seen_order` empty forever. The check was correct;
   its position was not. Read first, then write.

3. **Four rounds of hand-verification lost to one 40-millisecond test.** Three separate bugs
   shipped through eight lines in a single afternoon, each invisible on inspection and each
   caught instantly by running the code. These three assertions would have caught all three:

   ```python
   assert set(game.seen_order) == game.seen_notes
   assert len(game.seen_order) == len(game.seen_notes)
   assert len(game.seen_order) == len(set(game.seen_order))
   ```

   Pure functions with no I/O are the cheapest things in the world to test. Not testing them
   is not a time saving.
