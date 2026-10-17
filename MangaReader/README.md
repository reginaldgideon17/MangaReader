# 📚 MangaReader

A lightweight, feature-rich mobile manga reader built with **React Native** and **Expo**. **MangaReader** allows users to discover, search, read, and download manga directly on their mobile device using the MangaDex and AniList APIs.

---

## ✨ Features

- 🔍 **Browse & Search**: Discover popular, recently updated, or trending manga, or search by title and tags.
- 📖 **Flexible Reader**: Switch seamlessly between **Scroll (Vertical)** and **Paged** reader modes.
- 💾 **Offline Reading**: Download chapters to your local storage to read offline anytime.
- 🔖 **Library & Bookmarks**: Add favorite manga to your personal library.
- 🕒 **Reading History & Progress**: Keep track of read chapters and save your last-read position.
- 🌐 **Multi-Language Support**: Filter chapters by supported languages (e.g., English, Spanish, Japanese).
- 🔥 **AniList Integration**: View currently trending manga from AniList.
- 📱 **Cross-Platform**: Built for **Android** and **iOS** using Expo.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 57)
- **State & Storage**: `@react-native-async-storage/async-storage`, `expo-file-system`
- **Icons**: `@expo/vector-icons`
- **APIs**:
  - [MangaDex API](https://api.mangadex.org/)
  - [AniList GraphQL API](https://graphql.anilist.co/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Expo Go app](https://expo.dev/go) on your iOS/Android device OR an Android Emulator / iOS Simulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/reginaldgideon17/MangaReader.git
   cd MangaReader
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device/emulator:**
   - Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).
   - Press `a` in the terminal to launch on an **Android Emulator**.
   - Press `w` to open in a web browser.

---

## 📁 Project Structure

```text
MangaReader/
├── App.js                   # Main application logic & navigation state
├── app.json                 # Expo configuration
├── eas.json                 # EAS build configuration
├── package.json             # Project dependencies and scripts
└── src/
    ├── api/
    │   ├── anilist.js       # AniList GraphQL client
    │   └── mangadex.js      # MangaDex API client
    ├── components/          # Reusable UI components (MangaCard, PageImage)
    ├── screens/             # Main screens (MainScreen, DetailsScreen, ReaderScreen)
    ├── files.js             # Offline file storage & chapter download manager
    ├── storage.js           # Async Storage wrapper for app persistence
    └── theme.js             # App color schemes and styling constants
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
