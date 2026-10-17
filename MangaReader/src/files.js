// Everything that saves files on the phone: covers and downloaded chapters.
import { Directory, File, Paths } from 'expo-file-system';

export async function saveCover(manga) {
  try {
    const dir = new Directory(Paths.document, 'covers');
    dir.create({ idempotent: true, intermediates: true });
    const target = new File(dir, manga.id + '.jpg');
    if (!target.exists) {
      await File.downloadFileAsync(manga.cover, target);
    }
  } catch (e) {}
}

export function coverFor(manga) {
  try {
    const saved = new File(Paths.document, 'covers', manga.id + '.jpg');
    if (saved.exists) return saved.uri;
  } catch (e) {}
  return manga.cover;
}

// { chapterId: howManyPagesAreSaved }
export function countDownloaded(mangaId) {
  const found = {};
  try {
    const dir = new Directory(Paths.document, 'manga', mangaId);
    if (dir.exists) {
      dir.list().forEach((item) => {
        if (item instanceof Directory) {
          found[item.name] = item.list().length;
        }
      });
    }
  } catch (e) {}
  return found;
}

// The saved pages of a chapter, in order, or null if it isn't fully saved.
export function getSavedPages(mangaId, chapter) {
  try {
    const dir = new Directory(Paths.document, 'manga', mangaId, chapter.id);
    if (!dir.exists) return null;

    const saved = dir
      .list()
      .filter((item) => item instanceof File)
      .map((item) => item.uri)
      .sort();

    if (saved.length > 0 && saved.length >= chapter.pages) return saved;
  } catch (e) {}
  return null;
}

export async function downloadChapterPages(mangaId, chapter, pageUrls, onProgress) {
  const dir = new Directory(Paths.document, 'manga', mangaId, chapter.id);
  dir.create({ idempotent: true, intermediates: true });

  for (let i = 0; i < pageUrls.length; i++) {
    const name = String(i + 1).padStart(3, '0') + '.jpg';
    const target = new File(dir, name);

    if (!target.exists) {
      await File.downloadFileAsync(pageUrls[i], target);
    }
    onProgress(i + 1, pageUrls.length);
  }
}

export function deleteChapterFiles(mangaId, chapterId) {
  const dir = new Directory(Paths.document, 'manga', mangaId, chapterId);
  if (dir.exists) dir.delete();
}
