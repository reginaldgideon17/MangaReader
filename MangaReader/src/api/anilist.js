// Everything that talks to AniList.
export async function fetchTrending() {
  const query = `
    query {
      Page(page: 1, perPage: 30) {
        media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
          id
          title { romaji english }
          averageScore
          coverImage { large }
        }
      }
    }`;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query: query }),
  });
  if (!response.ok) throw new Error('Status ' + response.status);
  const json = await response.json();

  return json.data.Page.media.map((m) => ({
    id: 'al-' + m.id,
    title: m.title.english || m.title.romaji,
    cover: m.coverImage.large,
    badge: m.averageScore ? String(m.averageScore) : null,
  }));
}
