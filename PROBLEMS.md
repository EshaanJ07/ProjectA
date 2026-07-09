# Current Problems that need fixing

Status as of 2026-07-09. Line numbers refer to the files as they stand today.

Problems already fixed in `logic.py` (duplicate-weighted sampling, `random.choice` on a
set, the `lives == 0` fall-through, the endgame `IndexError`) are deliberately not listed
here. Everything below is still live.

Severity key: **Critical** = wrong behavior or unshippable · **High** = blocks deploy or
review · **Medium** = real defect, bounded blast radius · **Low** = polish.

---

## P1 — Concurrent requests on the same game corrupt game state

**Severity:** Critical · **Location:** `backend/logic.py:43-61`, `backend/main.py:37-42`

The endpoints in `main.py` are declared `def`, not `async def`. FastAPI runs synchronous
endpoints in a threadpool, so two requests carrying the same `game_id` are handled by two
real OS threads mutating the same `Game` object at the same time.

`update_game` reads `current_game.current_note` three separate times: once at line 45 to
compute `is_new`, again at line 56 to `.add()` it to `seen_notes`, and again at line 57 to
`.append()` it to `seen_order`. Another thread can execute line 59 and replace
`current_note` in between any two of those reads. The result is that one thread adds note
X to the set and appends note Y to the list. The two fields drift apart, duplicates
reappear in `seen_order`, and the biased sampling bug that was just fixed comes back.

This is not theoretical. Eight threads hammering one `Game` produced `len(seen_order)=89`
with only 84 distinct entries and `set(seen_order) != seen_notes`. In production it is
reached by a double-click, a retry on a flaky connection, or the player opening two tabs.
The frontend's 800 ms button-disable timer does not prevent it, because the timer is not
tied to the in-flight request.

Note that games belonging to *different* players never interfere. Locals like
`unseen_notes` live on the call frame and are per-invocation, and each `game_id` maps to
its own `Game` object. The hazard is strictly same-game concurrency.

**Proposed solution:** Read `current_note` once into a local at the top of `update_game`
and use that local for all three purposes. That closes the read-after-write window inside
the function. It does not make the whole read-modify-write sequence atomic — for that,
serialize per game. Do not reach for a `threading.Lock` as the permanent answer; see P2,
which makes an in-process lock meaningless anyway.

---

## P2 — Game state lives in an in-process dictionary

**Severity:** Critical · **Location:** `backend/main.py:18`

```python
games: dict[str, Game] = {}
```

Three separate failures follow from this one line.

*It breaks the moment you deploy.* That dict belongs to a single process. Running
`uvicorn --workers 4` or gunicorn — which is what Render, Fly, and every other host will
do, because one worker cannot saturate a box — gives you four independent dictionaries.
`/create-game` lands on worker 1; the player's next `/answer` round-robins to worker 3;
worker 3 has never heard of that `game_id` and returns a 500. Roughly three of every four
requests fail, nondeterministically, and it works perfectly on localhost.

*It leaks memory.* Nothing is ever evicted. Every game ever created is retained for the
lifetime of the process.

*It loses everything on restart.* Any deploy or crash silently ends every in-flight game.

**Proposed solution:** Move game state into Redis keyed by `game_id`, with a TTL (an hour
is generous) so abandoned games evict themselves. This fixes the process-boundary problem,
the memory leak, and the restart problem together, and it makes P1 solvable properly via a
per-key lock or an atomic server-side update. Until that lands, run exactly one worker and
document why.

---

## P3 — The frontend does not build

**Severity:** High · **Location:** `frontend/src/App.tsx:2`, `frontend/src/components/LandingScreen.tsx:24`

```
src/App.tsx(2,19): error TS6133: 'noteNames' is declared but its value is never read.
src/components/LandingScreen.tsx(24,12): error TS2741: Property 'playAudioRipple' is
    missing in type '{}' but required in type 'Props'.
```

`npm run build` exits 2. `npm run lint` exits 1. `LandingScreen` renders `<AudioCircle />`
without the prop that `AudioCircle` declares as required; it only works in dev because
Vite does not typecheck.

This is the single most damaging item in the repository, out of all proportion to the
thirty seconds it takes to fix. The first thing anyone does with a portfolio project is
clone it and run it, and right now that produces a compiler error rather than a game.

**Proposed solution:** Delete the unused `noteNames` import. Either pass
`playAudioRipple={false}` from `LandingScreen`, or give the prop a default in
`AudioCircle`. Then wire `tsc -b`, `eslint`, `ruff`, and `pytest` into a GitHub Actions
workflow so this can never regress unnoticed.

---

## P4 — There are no tests

**Severity:** High · **Location:** repository-wide

Not one test exists. This is conspicuous because `update_game`, `get_next_note`, and
`generate_game_notes` are pure functions with no I/O — about as testable as code gets.

The cost is already concrete rather than hypothetical. Three consecutive bugs shipped
through this function in a single afternoon: duplicates weighting the sampler, a dedupe
guard reading the wrong data structure, and then the right structure read at the wrong
time. Every one of them was invisible to inspection and would have been caught in under a
second by the same three assertions.

**Proposed solution:** Start with the invariant that ties `seen_notes` and `seen_order`
together, because that is the one that keeps breaking.

```python
def test_seen_structures_stay_in_sync():
    game = create_game()
    for _ in range(500):
        correct = "seen" if game.current_note in game.seen_notes else "new"
        update_game(correct, game)

    assert set(game.seen_order) == game.seen_notes
    assert len(game.seen_order) == len(game.seen_notes)
    assert len(game.seen_order) == len(set(game.seen_order))
```

Add `test_dead_game_stays_dead` (lives hits zero, further answers do not resurrect it) and
a test that perfect play past 85 distinct notes does not raise. That is `logic.py` covered.
Then a couple of Vitest tests around the frontend game loop.

---

## P5 — The backend cannot be installed

**Severity:** High · **Location:** `backend/pyproject.toml`

The file contains only Ruff formatting configuration. There is no `[project]` table, no
dependency list, and no `requirements.txt` anywhere. FastAPI, Pydantic, and Uvicorn are
never declared. Nobody who clones this repository can install the backend, and neither can
a CI runner or a deploy host.

**Proposed solution:** Add a `[project]` table with pinned dependencies, or a
`requirements.txt` if that's simpler. Include the `uvicorn main:app` command in the README.

---

## P6 — The README is one line

**Severity:** High · **Location:** `README.md`

The entire file is `# ProjectA`. There is no description of what the project does, no
screenshot, no run instructions, no architecture note. Combined with P3 and P5, the project
is effectively unrunnable by anyone but its author, which means the engineering inside it
is invisible.

The repository name compounds this. `ProjectA` tells a reader nothing, and it is the first
thing they see.

**Proposed solution:** Rename the repo to something descriptive (`notegame`,
`audio-memory`). Open the README with a GIF of the game, then what it is, why it was built,
how to run both halves, and a short section on the audio-latency work — which is real
engineering currently buried in commit messages where nobody will ever find it.

---

## P7 — The API base URL is hardcoded

**Severity:** High · **Location:** `frontend/src/App.tsx:7`

```ts
const BASE_URL = "http://127.0.0.1:8000";
```

The frontend can only ever talk to a backend on the developer's own machine. The project
cannot be deployed as-is.

**Proposed solution:** Read from `import.meta.env.VITE_API_URL`, with the localhost value
in a committed `.env.example` and the real one set in the host's dashboard.

---

## P8 — The answer key is sent to the browser on every response

**Severity:** High · **Location:** `backend/main.py:27,37`, `backend/schemas.py:9-10`

Both endpoints declare `response_model=Game`, and `Game` carries `seen_notes` and
`seen_order` — the complete list of notes already played. Every response tells the client
exactly what the correct answer is. Anyone with devtools open can score indefinitely.

`seen_order` also grows by one entry per turn with no ceiling, so the response body grows
linearly with how well the player is doing.

**Proposed solution:** Define a separate `GamePublic` response model exposing only
`game_id`, `lives`, `score`, and `current_note`, and use it as the `response_model` on both
routes. Keep the full `Game` as the internal/stored shape. "I made the server authoritative
and stopped trusting the client" is worth being able to say out loud.

---

## P9 — An unknown game ID returns a 500

**Severity:** Medium · **Location:** `backend/main.py:40`

```python
updated_game = update_game(request.answer, games[request.game_id])
```

An unrecognized `game_id` raises `KeyError`, which FastAPI surfaces as an unhandled 500.
This is reachable today by any expired, restarted, or fabricated game ID — and, per P2, by
normal traffic as soon as there is more than one worker.

**Proposed solution:** Look the game up explicitly and `raise HTTPException(status_code=404)`
when it is missing. Consider rejecting answers to games that have already ended, rather than
letting them be replayed.

---

## P10 — CORS allows every origin with credentials enabled

**Severity:** Medium · **Location:** `backend/main.py:8-16`

```python
origins = ["*"]  # Temporarily allowing all origins for testing
allow_credentials=True
```

Starlette responds to a wildcard-plus-credentials configuration by echoing back whatever
`Origin` the request carried, which means any website on the internet can make credentialed
requests to this API. The comment says "temporarily"; the commit that introduced it is
dated 2026-06-11.

**Proposed solution:** Replace the wildcard with an explicit list of allowed origins, read
from an environment variable so localhost and the deployed frontend can differ. If no
cookies or auth headers are in play, set `allow_credentials=False` and the wildcard becomes
safe.

---

## P11 — Ten megabytes of audio is fetched before first paint

**Severity:** Medium · **Location:** `frontend/src/assets/audio/noteMap.ts`

`noteMap.ts` eagerly globs all 85 WAV files, constructs an `Audio` object for each with
`preload="auto"`, and then `preloadAllNotes()` calls `.load()` on every one of them at
module scope. Measured total: **9.99 MB**, requested before React even mounts. On a phone
or a hotel connection the landing page is unusable.

The same files, committed across several format generations (mp3, then wav, then shorter
wav, then eight octaves), have inflated `.git` to **46.4 MB**.

**Proposed solution:** Re-encode to Opus or MP3 — roughly a twentieth of the size for
indistinguishable piano samples — and load lazily, or assemble a single audio sprite driven
through the Web Audio API. Target under 500 KB. This is a natural continuation of the
latency investigation already visible in the commit history; measure before and after and
put the numbers in the README.

---

## P12 — Network failures are invisible to the user

**Severity:** Medium · **Location:** `frontend/src/App.tsx:50,64`

Neither `fetch` call checks `response.ok`, and neither has a `.catch`. If the backend is
down, slow, or returns the 500 from P9, the promise rejects unhandled, no state updates,
and the UI simply sits on a blank game screen forever. The player sees a frozen page with
no explanation.

**Proposed solution:** Check `response.ok`, wrap both calls in `try`/`catch`, and surface a
retry affordance. A dedicated `useGame` hook is a reasonable place to centralize this.

---

## P13 — Buttons re-enable on a timer, not on the request completing

**Severity:** Medium · **Location:** `frontend/src/App.tsx:40-46`

`DisableButtonsTemporarily` disables the answer buttons for a fixed 800 ms, chosen to match
the ripple animation. It has nothing to do with whether the `fetch` has returned. On a slow
connection the buttons re-enable while a request is still in flight, the player clicks
again, and two concurrent `/answer` calls hit the same `game_id` — which is precisely the
trigger for P1.

**Proposed solution:** Drive the disabled state from an `isSubmitting` flag set before the
request and cleared in a `finally`, and let the animation timing remain independent.

---

## P14 — The game-over screen is a placeholder

**Severity:** Medium · **Location:** `frontend/src/components/GameOverScreen.tsx`

The component is a single unstyled `<div>Final Score: {score}</div>`, and `App.tsx:131`
still carries the comment `{/* Needs UI implementation */}`. There is no play-again button,
so the game is unrecoverable without a page refresh — which, given P11, re-downloads ten
megabytes of audio.

`ReplayNoteButton` is likewise an unstyled bare `<button>Play Again</button>` in the middle
of an otherwise finished design.

**Proposed solution:** Build the screen out to match the landing page, add a restart button
that calls `/create-game` and resets state in place, and style `ReplayNoteButton` to match
the existing `Button` component.

---

## P15 — The endgame is degenerate

**Severity:** Medium · **Location:** `backend/logic.py:64-78`

Once all 85 notes have been heard — reachable in roughly 183 turns of good play — the
`unseen_notes` list is permanently empty, every subsequent note is one the player has
already heard, and answering `"seen"` forever scores without any risk of losing a life. A
20,000-turn simulation of perfect play never dies and never stops scoring.

This is not a crash. It is an undecided design question showing up as a default.

**Proposed solution:** Pick an intent and implement it: end the game with a win at 85/85,
widen the note pool as the score climbs, or evict the oldest entries from `seen_notes` so
the set stays bounded and the game stays hard. The last option is the most interesting and
turns the score ceiling into a genuine memory-span measurement.

---

## P16 — `get_next_note` has an undocumented precondition

**Severity:** Low · **Location:** `backend/logic.py:64`

The function requires `seen_order` to be non-empty and will raise
`IndexError: Cannot choose from an empty sequence` otherwise. `update_game` always
satisfies this, so there is no live bug. But called directly on a fresh game it fails about
half the time, depending on which branch the coin flip takes — which makes
`get_next_note(create_game())` a fifty-percent-flaky test, and that is the most obvious
first test anyone would write.

**Proposed solution:** State the precondition in the docstring. Do not add a runtime guard
for a condition the only caller already enforces.

---

## P17 — Dead code, and a filename that breaks on Linux

**Severity:** Low · **Location:** `frontend/src/`

`components/Note.tsx` is never imported. `assets/audio/audioEffects.ts` is never imported
either, and it does `import buttonClick from "./effects/soundclick.wav"` while the file on
disk is `soundclick.WAV`. Windows does not care about the case; the Linux host this
eventually deploys to will. `App.css` is empty, and `assets/hero.png`, `assets/react.svg`,
and `assets/vite.svg` are leftovers from the Vite template. All of it is committed.

**Proposed solution:** Delete what is unused. If the button-click sound is wanted, wire it
up and rename the file to lowercase `.wav` in the same commit.

---

## P18 — `Lives` can render an `undefined` CSS class

**Severity:** Low · **Location:** `frontend/src/components/Lives.tsx:7`

`lifeColors` is keyed `3`, `2`, `1`, and `-1`. There is no entry for `0`, so
`lifeColors[0]` yields `undefined` and the rendered element gets `class="... undefined ..."`.
The `-1` key is a fossil from the days when the backend let lives go negative; that bug is
fixed and the key is now unreachable dead code.

**Proposed solution:** Delete the `-1` entry and give the lookup a fallback, or clamp
`count` before indexing.

---

## P19 — No responsive layout and no accessibility affordances

**Severity:** Low · **Location:** `frontend/src/components/`

Sizing is fixed throughout (`h-75 w-75` on the audio circle, `w-25` on the buttons, a
`text-[2.2rem]` title) with no breakpoints, so the layout does not adapt to a phone — which
is exactly where a casual ear-training game gets played. Score and lives changes are
animated but not announced, so a screen reader user learns nothing when either changes.
There are no keyboard bindings for the two primary actions. The footer sits at 10 px in
`#9CA3AF`, well under contrast minimums.

**Proposed solution:** Add responsive variants at the `sm`/`md` breakpoints, wrap the score
and lives in `aria-live="polite"` regions, bind the `new` and `heard` actions to keys, and
darken the footer.

---

## P20 — State sprawl and naming drift in `App.tsx`

**Severity:** Low · **Location:** `frontend/src/App.tsx`

Eight separate `useState` calls track what is fundamentally one server-owned object plus
three animation flags. Helper functions `ActivateAudioRipple` and `DisableButtonsTemporarily`
are PascalCase, which in a React file reads as a component. `const [hasGameStarted,
setStartGame]` pairs a setter name with a different noun than its state. `Button` receives
both `isDisabled` and `disabled` carrying the same value. `GameScreen` opens with a fragment
wrapping a fragment.

None of this is a defect. All of it is what a reviewer reads first.

**Proposed solution:** Hold the server's game state in a single `useState<GamePublic | null>`
and keep the animation flags separate, rename the helpers to `camelCase`, fix
`setHasGameStarted`, collapse the duplicate prop, and remove the redundant fragment.
