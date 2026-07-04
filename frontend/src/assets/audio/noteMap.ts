// src/audio/noteMap.ts

const audioFiles = import.meta.glob("./piano-notes/**/*.{wav,mp3,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function getNoteNameFromPath(path: string): string {
  const fileName = path.split("/").pop();

  if (!fileName) {
    throw new Error(`Could not get filename from path: ${path}`);
  }

  return fileName.replace(/\.(wav|mp3|ogg)$/i, "");
}

export const noteMap: Record<string, HTMLAudioElement> = Object.fromEntries(
  Object.entries(audioFiles).map(([path, url]) => {
    const noteName = getNoteNameFromPath(path);

    const audio = new Audio(url);
    audio.preload = "auto";

    return [noteName, audio];
  })
);

export const noteNames = Object.keys(noteMap).sort();

export function preloadAllNotes() {
  Object.values(noteMap).forEach((audio) => {
    audio.load();
  });
}
