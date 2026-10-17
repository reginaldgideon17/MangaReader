// The places manga can come from ("sources").
// Right now there is one. Later we can add more to this list.
export const SOURCES = [
  { id: 'mangadex', name: 'MangaDex', icon: 'public' },
];

// Which source does this manga belong to? (older saved manga have no note, so MangaDex)
export function sourceOf(manga) {
  return SOURCES.find((s) => s.id === manga.source) || SOURCES[0];
}