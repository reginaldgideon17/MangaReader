import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  BackHandler,
  useWindowDimensions,
} from 'react-native';

import { loadValue, saveValue } from './src/storage';
import {
  saveCover,
  coverFor,
  countDownloaded,
  getSavedPages,
  downloadChapterPages,
  deleteChapterFiles,
} from './src/files';
import {
  fetchManga,
  fetchMangaDetails,
  fetchChapters,
  fetchPageUrls,
  fetchChapterTotal,
  PAGE_SIZE,
} from './src/api/mangadex';
import { fetchTrending } from './src/api/anilist';
import ReaderScreen from './src/screens/ReaderScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import MainScreen from './src/screens/MainScreen';

export default function App() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const COLUMNS = 3;
  const cardWidth = screenWidth / COLUMNS - 16;

  // ----- the app's memory -----
  const [tab, setTab] = useState('browse');
  const [mangaList, setMangaList] = useState([]);
  const [status, setStatus] = useState('Loading...');
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterStatus, setChapterStatus] = useState('');
  const [reading, setReading] = useState(null);
  const [pages, setPages] = useState([]);
  const [readerStatus, setReaderStatus] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [library, setLibrary] = useState([]);
  const [readIds, setReadIds] = useState({});
  const [history, setHistory] = useState([]);
  const [lastRead, setLastRead] = useState({});
  const [knownTotals, setKnownTotals] = useState({});
  const [activeQuery, setActiveQuery] = useState('');
  const [browseFilters, setBrowseFilters] = useState({ sort: 'popular', tag: null });
  const [info, setInfo] = useState(null); // extra details of the open manga
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [readMode, setReadMode] = useState('scroll'); // 'scroll' or 'paged'
  const [showBar, setShowBar] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // the reader tells us which page is on screen
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 30 }).current;
  const onViewable = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentPage(viewableItems[0].index + 1);
    }
  }).current;
  const [latestTotals, setLatestTotals] = useState({});
  const [downloadedIds, setDownloadedIds] = useState({});
  const [lang, setLang] = useState('en');
  const [trending, setTrending] = useState([]);
  const [trendingStatus, setTrendingStatus] = useState('');
  

  // ----- things the app can do -----
  // what we send to MangaDex from our filters
  function apiFilters(f) {
    return { sort: f.sort, tagId: f.tag ? f.tag.id : null };
  }

  async function loadManga(text, filters = browseFilters) {
    setStatus('Loading...');
    setActiveQuery(text);
    setBrowseFilters(filters);
    try {
      const list = await fetchManga(text, 0, apiFilters(filters));
      setMangaList(list);
      setCanLoadMore(list.length >= PAGE_SIZE);
      setStatus('Found ' + list.length + ' manga!');
    } catch (e) {
      setStatus('Something went wrong: ' + e.message);
    }
  }

  // called when you scroll near the bottom of Browse
  async function loadMore() {
    if (loadingMore || !canLoadMore || mangaList.length === 0) return;
    if (status.startsWith('Loading')) return;

    setLoadingMore(true);
    try {
      const more = await fetchManga(activeQuery, mangaList.length, apiFilters(browseFilters));
      const have = new Set(mangaList.map((m) => m.id));
      const fresh = more.filter((m) => !have.has(m.id));
      setMangaList([...mangaList, ...fresh]);
      setCanLoadMore(more.length >= PAGE_SIZE && fresh.length > 0);
    } catch (e) {
      // no internet right now - scrolling again will try again
    }
    setLoadingMore(false);
  }

  // called when you pull the list down
  async function refreshCurrent() {
    setRefreshing(true);
    if (tab === 'browse') await loadManga(activeQuery);
    else if (tab === 'trending') await loadTrending();
    else if (tab === 'library') await checkNewChapters();
    setRefreshing(false);
  }

  async function loadTrending() {
    setTrendingStatus('Loading trending...');
    try {
      setTrending(await fetchTrending());
      setTrendingStatus('');
    } catch (e) {
      setTrendingStatus('Something went wrong: ' + e.message);
    }
  }

  function openFromTrending(item) {
    setSearchText(item.title);
    setTab('browse');
    loadManga(item.title, { sort: 'popular', tag: null });
  }

  // tapping the SOURCE on a manga: show that source's manga
  function goToSource() {
    setSelected(null);
    setSearchText('');
    setTab('browse');
    loadManga('', { sort: 'popular', tag: null });
  }

  // tapping a GENRE on a manga: show manga with that genre
  function goToGenre(tag) {
    setSelected(null);
    setSearchText('');
    setTab('browse');
    loadManga('', { sort: 'popular', tag: tag });
  }

  function changeSort(sort) {
    loadManga(activeQuery, { ...browseFilters, sort: sort });
  }

  function clearTag() {
    loadManga(activeQuery, { ...browseFilters, tag: null });
  }

  // which language will we use for this manga?
  function pickLang(manga) {
    const has = manga.langs && manga.langs.length > 0;
    return has && !manga.langs.includes(lang) ? manga.langs[0] : lang;
  }

  // a name tag for "this manga in this language"
  function keyFor(manga) {
    return manga.id + ':' + pickLang(manga);
  }

  function hasNew(manga) {
    const key = keyFor(manga);
    return (
      latestTotals[key] !== undefined &&
      knownTotals[key] !== undefined &&
      latestTotals[key] > knownTotals[key]
    );
  }

  // ask MangaDex how many chapters each library manga has now
  async function checkNewChapters() {
    const latest = {};
    const known = { ...knownTotals };
    let changed = false;

    for (const m of library) {
      try {
        const key = keyFor(m);
        const total = await fetchChapterTotal(m.id, pickLang(m));
        latest[key] = total;
        setLatestTotals({ ...latest });
        if (known[key] === undefined) {
          known[key] = total; // first time: just remember it, no NEW badge
          changed = true;
        }
      } catch (e) {}
    }

    if (changed) {
      setKnownTotals(known);
      saveValue('known', known);
    }
  }

  function openManga(manga) {
    const code = pickLang(manga);
    if (code !== lang) setLang(code);

    // opening it counts as "I saw the new chapters"
    const key = keyFor(manga);
    if (latestTotals[key] !== undefined) {
      const updated = { ...knownTotals, [key]: latestTotals[key] };
      setKnownTotals(updated);
      saveValue('known', updated);
    }

    setSelected(manga);
  }

  function toggleReadMode() {
    const next = readMode === 'scroll' ? 'paged' : 'scroll';
    setReadMode(next);
    saveValue('readMode', next);
  }

  function chooseLang(code) {
    setLang(code);
    
    saveValue('lang', code);
  }

  function toggleLibrary(manga) {
    const alreadyIn = library.some((m) => m.id === manga.id);
    const updated = alreadyIn
      ? library.filter((m) => m.id !== manga.id)
      : [manga, ...library];

    setLibrary(updated);
    saveValue('library', updated);
    if (!alreadyIn) saveCover(manga);
  }

  function markRead(id) {
    const updated = { ...readIds, [id]: true };
    setReadIds(updated);
    saveValue('read', updated);
  }

  function openChapter(chapter) {
    setReading(chapter);
    markRead(chapter.id);

    // put this manga at the front of History (no doubles, max 30)
    const updated = [selected, ...history.filter((m) => m.id !== selected.id)].slice(0, 30);
    setHistory(updated);
    saveValue('history', updated);

    // remember the last chapter opened for this manga
    const newLast = { ...lastRead, [selected.id]: chapter };
    setLastRead(newLast);
    saveValue('lastRead', newLast);
  }

  function removeFromHistory(manga) {
    const updated = history.filter((m) => m.id !== manga.id);
    setHistory(updated);
    saveValue('history', updated);
  }

  function confirmClearHistory() {
    Alert.alert('Clear history?', 'This only clears the History tab. Your library stays.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setHistory([]);
          saveValue('history', []);
        },
      },
    ]);
  }

  function isDownloaded(chapter) {
    return (downloadedIds[chapter.id] || 0) >= chapter.pages;
  }

  async function downloadChapter(chapter) {
    try {
      setDownloadStatus('Starting download...');
      const urls = await fetchPageUrls(chapter.id);

      await downloadChapterPages(selected.id, chapter, urls, (done, total) => {
        setDownloadStatus('Downloading ' + done + ' / ' + total);
      });

      setDownloadStatus('Chapter ' + chapter.number + ' downloaded!');
    } catch (e) {
      setDownloadStatus('Download failed: ' + e.message);
    }
  }

  function confirmDelete(chapter) {
    Alert.alert(
      'Delete download?',
      'Chapter ' + chapter.number + ' will be removed from your phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              deleteChapterFiles(selected.id, chapter.id);
              setDownloadStatus('Deleted chapter ' + chapter.number);
            } catch (e) {
              setDownloadStatus('Delete failed: ' + e.message);
            }
          },
        },
      ]
    );
  }

  // ----- things that happen automatically -----

  // when the app opens
  useEffect(() => {
    async function startUp() {
      const savedLibrary = await loadValue('library', []);
      setLibrary(savedLibrary);
      savedLibrary.forEach(saveCover);

      setReadIds(await loadValue('read', {}));
      setLang(await loadValue('lang', 'en'));
      setHistory(await loadValue('history', []));
      setLastRead(await loadValue('lastRead', {}));
      setKnownTotals(await loadValue('known', {}));
      setReadMode(await loadValue('readMode', 'scroll'));
    }
    startUp();
    loadManga('');
  }, []);

  // when you open a manga, fetch its description, genres and author
  useEffect(() => {
    setInfo(null);
    if (!selected) return;

    let active = true;
    fetchMangaDetails(selected.id)
      .then((details) => {
        if (active) setInfo(details);
      })
      .catch(() => {}); // offline: we just show what we already know

    return () => {
      active = false;
    };
  }, [selected ? selected.id : null]);

  // phone's BACK button: go back one screen instead of closing the app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (reading) {
        setReading(null);
        return true;
      }
      if (selected) {
        setSelected(null);
        return true;
      }
      return false; // on the main screen: let the phone close the app
    });
    return () => sub.remove();
  }, [reading, selected]);

  // new chapter -> start at page 1 with the bar showing
  useEffect(() => {
    setCurrentPage(1);
    setShowBar(true);
  }, [reading]);

  // when you open the Trending tab for the first time
  useEffect(() => {
    if (tab === 'trending' && trending.length === 0) loadTrending();
  }, [tab]);

  // when you open the Library tab, look for new chapters
  useEffect(() => {
    if (tab === 'library' && library.length > 0) checkNewChapters();
  }, [tab, library.length]);

  // keep the "downloaded" marks up to date
  useEffect(() => {
    if (selected) setDownloadedIds(countDownloaded(selected.id));
  }, [selected, downloadStatus]);

  // when you open a manga, or change its language
  useEffect(() => {
    if (!selected) return;

    async function loadChapters() {
      setChapters([]);
      setChapterStatus('Loading chapters...');
      const cacheKey = 'chapters:' + selected.id + ':' + lang;

      const cached = await loadValue(cacheKey, null);
      if (cached) setChapters(cached);

      try {
        const list = await fetchChapters(selected.id, lang);
        setChapters(list);
        setChapterStatus(list.length === 0 ? 'No chapters found in this language.' : '');
        saveValue(cacheKey, list);
      } catch (e) {
        if (cached) {
          setChapterStatus('Offline - showing saved chapters');
        } else {
          setChapterStatus('Something went wrong: ' + e.message);
        }
      }
    }

    loadChapters();
  }, [selected, lang]);

  // when you open a chapter
  useEffect(() => {
    if (!reading) return;

    async function loadPages() {
      setPages([]);

      const saved = getSavedPages(selected.id, reading);
      if (saved) {
        setPages(saved);
        setReaderStatus('Reading saved copy');
        return;
      }

      setReaderStatus('Loading pages...');
      try {
        setPages(await fetchPageUrls(reading.id));
        setReaderStatus('');
      } catch (e) {
        setReaderStatus('Something went wrong: ' + e.message);
      }
    }

    loadPages();
  }, [reading]);

  // ----- what's on the screen -----
  if (reading) {
    return (
      <ReaderScreen
        chapters={chapters}
        currentPage={currentPage}
        onViewable={onViewable}
        openChapter={openChapter}
        pages={pages}
        readMode={readMode}
        readerStatus={readerStatus}
        reading={reading}
        screenHeight={screenHeight}
        screenWidth={screenWidth}
        selected={selected}
        setReading={setReading}
        setShowBar={setShowBar}
        showBar={showBar}
        toggleReadMode={toggleReadMode}
        viewConfig={viewConfig}
      />
    );
  }

  if (selected) {
    return (
      <DetailsScreen
        chapterStatus={chapterStatus}
        chapters={chapters}
        chooseLang={chooseLang}
        confirmDelete={confirmDelete}
        downloadChapter={downloadChapter}
        downloadStatus={downloadStatus}
        goToGenre={goToGenre}
        goToSource={goToSource}
        info={info}
        isDownloaded={isDownloaded}
        lang={lang}
        lastRead={lastRead}
        library={library}
        openChapter={openChapter}
        readIds={readIds}
        selected={selected}
        setSelected={setSelected}
        toggleLibrary={toggleLibrary}
      />
    );
  }

  return (
    <MainScreen
      COLUMNS={COLUMNS}
      activeQuery={activeQuery}
      browseFilters={browseFilters}
      changeSort={changeSort}
      clearTag={clearTag}
      cardWidth={cardWidth}
      confirmClearHistory={confirmClearHistory}
      hasNew={hasNew}
      history={history}
      library={library}
      loadManga={loadManga}
      loadMore={loadMore}
      loadTrending={loadTrending}
      loadingMore={loadingMore}
      mangaList={mangaList}
      openFromTrending={openFromTrending}
      openManga={openManga}
      refreshCurrent={refreshCurrent}
      refreshing={refreshing}
      removeFromHistory={removeFromHistory}
      searchText={searchText}
      setSearchText={setSearchText}
      setTab={setTab}
      status={status}
      tab={tab}
      trending={trending}
      trendingStatus={trendingStatus}
    />
  );
}