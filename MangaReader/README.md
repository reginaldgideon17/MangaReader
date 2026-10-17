# 📖 MangaReader — Mobile Manga Companion

**MangaReader** is a modern, fast, and intuitive cross-platform mobile manga reader app built with **React Native** and **Expo**. Designed with manga enthusiasts in mind, it provides a seamless reading experience complete with live search, community trending feeds, personalized libraries, offline downloads, and customizable reading modes.

---

## 🌟 About The Project

MangaReader was created to solve common pain points in mobile manga reading: slow loading times, clunky navigation, lack of offline support, and scattered reading progress tracking.

By leveraging the official **MangaDex API** for content delivery and **AniList** for community trending data, MangaReader delivers a clean, ad-free, mobile-first manga application with native-like performance on both Android and iOS devices.

---

## 🔥 Key Features & Highlights

### 🧭 1. Discover & Search
- **Live Search**: Fast search across thousands of manga titles via MangaDex.
- **Tag & Genre Filtering**: Filter titles by genres (Action, Romance, Sci-Fi, Fantasy, Slice of Life, and more).
- **Sorting Options**: Sort search results by **Most Popular** or **Recently Updated**.
- **Infinite Scrolling**: Smooth paginated feed loading more titles automatically as you scroll down.

### 🔥 2. Trending Feed (AniList)
- Integrated with the **AniList GraphQL API** to display real-time community-driven trending manga series.
- Easily transition from trending discovery to reading chapters on MangaDex.

### 📚 3. Library & Favorites
- Bookmark your favorite manga series into your personal **Library**.
- **New Chapter Notifications**: Visual indicators highlight series that have unread chapters published.

### 📜 4. Reading History & Tracking
- Automatically saves your reading progress for every chapter down to the **exact page number**.
- **Resume Reading**: Instantly jump back into your last read position.
- Dedicated **History tab** to review, resume, or clear your recent reading log.

### 📖 5. Dual Reader Modes
- **Vertical Scroll Mode (Webtoon-style)**: Continuous vertical scrolling ideal for webtoons and digital manga.
- **Paged Mode (Book-style)**: Traditional page-turn mode with tap/swipe controls.
- **Smart On-Screen HUD**: Toggle header/footer navigation bars with a tap for an immersive fullscreen reading experience.
- **Chapter Switcher**: Quick navigation to next/previous chapters directly inside the reader.

### 💾 6. Offline Chapter Downloads
- Download full chapters directly to device storage using `expo-file-system`.
- Read your downloaded manga anywhere—even without an internet or cell connection.
- Download progress indicators and easy chapter file management.

---

## 📱 Screen Breakdown

| Tab / Screen | Description |
| :--- | :--- |
| **Browse / Discover** | Main catalog search, genre filters, and popular manga lists. |
| **Library** | Personalized bookmarks with unread chapter count indicators. |
| **Trending** | Real-time trending manga powered by AniList. |
| **History** | Log of recently read chapters with quick resume capabilities. |
| **Manga Details** | Summary, cover art, author details, tag list, language selector, and chapter list. |
| **Reader** | Fullscreen manga viewer supporting vertical scroll and paged reading modes. |

---

## 🏗️ Architecture & Technology Stack

- **Mobile Framework**: [React Native](https://reactnative.dev/) (v0.86)
- **Tooling & Runtime**: [Expo SDK 57](https://expo.dev/)
- **Icons & UI**: [`@expo/vector-icons`](https://docs.expo.dev/guides/icons/) (Material Icons), Custom M3-inspired color palette
- **Local Persistence**:
  - [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) for settings, history, and library state.
  - [`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem/) for offline cover art and downloaded chapter pages.
- **External Data Services**:
  - **MangaDex REST API v5** (Manga metadata, chapter feeds, image CDN URLs)
  - **AniList GraphQL API** (Trending manga discovery)

---

## 🛠️ Project Structure

```text
MangaReader/
├── App.js                   # Application state, persistent storage hooks, & tab router
├── app.json                 # Expo project configuration & Android package details
├── eas.json                 # Expo Application Services build profiles
├── package.json             # Dependencies and scripts
└── src/
    ├── api/
    │   ├── anilist.js       # AniList GraphQL query fetching trending titles
    │   └── mangadex.js      # MangaDex client (manga, chapters, page CDN URLs)
    ├── components/
    │   ├── MangaCard.js     # Responsive grid card component with cover art
    │   └── PageImage.js     # Optimized image viewer component for manga pages
    ├── screens/
    │   ├── MainScreen.js    # Tab container (Browse, Library, Trending, History)
    │   ├── DetailsScreen.js # Manga overview, language filter, and chapter list
    │   └── ReaderScreen.js  # Fullscreen reader supporting Scroll and Paged modes
    ├── files.js             # Local filesystem manager for downloaded chapters & covers
    ├── storage.js           # Async storage persistence helper
    └── theme.js             # Color definitions and layout theme constants
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo Go App](https://expo.dev/go) installed on your Android/iOS device **OR** an Android Emulator.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/reginaldgideon17/MangaReader.git
cd MangaReader
npm install
```

### 3. Running the App

Start the Expo development server:

```bash
npx expo start
```

- **On Physical Device**: Scan the QR code displayed in the terminal using the **Expo Go** app (Android) or Camera app (iOS).
- **On Android Emulator**: Press `a` in the terminal.
- **On Web**: Press `w` to launch the web preview.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/reginaldgideon17/MangaReader/issues).

---

## 📝 License

This project is open-source and released under the [MIT License](LICENSE).
