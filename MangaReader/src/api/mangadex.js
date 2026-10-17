// Everything that talks to MangaDex.
const API = 'https://api.mangadex.org';

// how many manga we ask for each time
export const PAGE_SIZE = 30;

// Turns MangaDex's messy answer for ONE manga into a tidy object.
function toManga(item) {
  const attrs = item.attributes;
  const titles = attrs.title;
  const cover = item.relationships.find((r) => r.type === 'cover_art');
  const author = item.relationships.find((r) => r.type === 'author');

  // MangaDex keeps descriptions in many languages. Take English, or any.
  const descs = attrs.description || {};
  const description = descs.en || Object.values(descs)[0] || '';

  // "tags" are the genres and themes (Action, Romance, School Life...)
  const tags = (attrs.tags || [])
    .filter((tag) => ['genre', 'theme'].includes(tag.attributes.group))
    .map((tag) => ({ id: tag.id, name: tag.attributes.name.en }))
    .filter((tag) => tag.name);

  return {
    id: item.id,
    source: 'mangadex',
    title: titles.en || Object.values(titles)[0],
    cover:
      cover && cover.attributes
        ? 'https://uploads.mangadex.org/covers/' + item.id + '/' + cover.attributes.fileName + '.256.jpg'
        : null,
    langs: attrs.availableTranslatedLanguages || [],
    description: description,
    tags: tags,
    status: attrs.status || '',
    year: attrs.year || null,
    author: author && author.attributes ? author.attributes.name : '',
  };
}

// filters: { sort: 'popular' | 'latest', tagId: 'some-genre-id' }
// "offset" means "skip this many" - that is how we ask for page 2, page 3...
export async function fetchManga(text, offset = 0, filters = {}) {
  let url =
    API + '/manga?limit=' + PAGE_SIZE + '&offset=' + offset +
    '&includes[]=cover_art&includes[]=author&contentRating[]=safe';

  if (filters.tagId) {
    url = url + '&includedTags[]=' + filters.tagId;
  }

  if (text.trim() !== '') {
    url = url + '&title=' + encodeURIComponent(text.trim());
  } else if (filters.sort === 'latest') {
    url = url + '&order[latestUploadedChapter]=desc';
  } else {
    url = url + '&order[followedCount]=desc';
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Status ' + response.status);
  const json = await response.json();

  return json.data.map(toManga);
}

// Full info for ONE manga (description, genres, author...).
export async function fetchMangaDetails(mangaId) {
  const url = API + '/manga/' + mangaId + '?includes[]=cover_art&includes[]=author';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Status ' + response.status);
  const json = await response.json();
  return toManga(json.data);
}

// Gets ALL chapters, 500 at a time (up to 3000).
export async function fetchChapters(mangaId, lang) {
  const all = [];
  let offset = 0;
  let total = 0;

  do {
    const url =
      API + '/manga/' + mangaId +
      '/feed?translatedLanguage[]=' + lang + '&order[chapter]=asc&limit=500' +
      '&offset=' + offset +
      '&contentRating[]=safe&contentRating[]=suggestive';

    const response = await fetch(url);
    if (!response.ok) throw new Error('Status ' + response.status);
    const json = await response.json();

    total = json.total;
    all.push(...json.data);
    offset += 500;
  } while (offset < total && offset < 3000);

  // Different translation groups can upload the same chapter number.
  // We keep only the first one so you don't see "Chapter 5" three times.
  const seen = {};
  return all
    .filter((item) => item.attributes.pages > 0)
    .filter((item) => {
      const n = item.attributes.chapter;
      if (n === null || n === undefined) return true;
      if (seen[n]) return false;
      seen[n] = true;
      return true;
    })
    .map((item) => ({
      id: item.id,
      number: item.attributes.chapter,
      title: item.attributes.title,
      pages: item.attributes.pages,
    }));
}

// How many chapters exist in a language (asks for just 1, reads the "total").
export async function fetchChapterTotal(mangaId, lang) {
  const url =
    API + '/manga/' + mangaId +
    '/feed?translatedLanguage[]=' + lang + '&limit=1' +
    '&contentRating[]=safe&contentRating[]=suggestive';

  const response = await fetch(url);
  if (!response.ok) throw new Error('Status ' + response.status);
  const json = await response.json();
  return json.total;
}

// The web address of every page picture in a chapter.
export async function fetchPageUrls(chapterId) {
  const response = await fetch(API + '/at-home/server/' + chapterId);
  if (!response.ok) throw new Error('Status ' + response.status);
  const json = await response.json();

  return json.chapter.dataSaver.map(
    (file) => json.baseUrl + '/data-saver/' + json.chapter.hash + '/' + file
  );
}