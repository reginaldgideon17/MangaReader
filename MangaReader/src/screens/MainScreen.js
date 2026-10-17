import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import MangaCard from '../components/MangaCard';
import { coverFor } from '../files';

// the buttons at the bottom of the screen
const TABS = [
  { key: 'browse', label: 'Browse', icon: 'explore' },
  { key: 'library', label: 'Library', icon: 'collections-bookmark' },
  { key: 'trending', label: 'Trending', icon: 'trending-up' },
  { key: 'history', label: 'History', icon: 'history' },
];

const TITLES = {
  browse: 'Discover',
  library: 'Library',
  trending: 'Trending',
  history: 'History',
};

export default function MainScreen({
  COLUMNS,
  activeQuery,
  browseFilters,
  changeSort,
  clearTag,
  cardWidth,
  confirmClearHistory,
  hasNew,
  history,
  library,
  loadManga,
  loadMore,
  loadTrending,
  loadingMore,
  mangaList,
  openFromTrending,
  openManga,
  refreshCurrent,
  refreshing,
  removeFromHistory,
  searchText,
  setSearchText,
  setTab,
  status,
  tab,
  trending,
  trendingStatus,
}) {
  const listData =
    tab === 'library' ? library : tab === 'history' ? history : tab === 'trending' ? trending : mangaList;

  const loadingNow =
    (tab === 'browse' && status.startsWith('Loading')) ||
    (tab === 'trending' && trendingStatus.startsWith('Loading'));
  const errorText =
    tab === 'browse' && status.startsWith('Something')
      ? status
      : tab === 'trending' && trendingStatus.startsWith('Something')
      ? trendingStatus
      : '';

  const emptyIcon = { browse: 'search', library: 'collections-bookmark', trending: 'trending-up', history: 'history' }[tab];
  const emptyText =
    tab === 'library'
      ? 'Your library is empty.\nOpen a manga and tap "Add to library".'
      : tab === 'history'
      ? 'Nothing read yet.\nOpen a chapter and it will show up here.'
      : 'No manga found.';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 50 }}>
      {/* TOP: title (+ clear button on History) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginTop: 8,
          marginBottom: 12,
        }}
      >
        <Text style={{ flex: 1, color: colors.text, fontSize: 28, fontWeight: 'bold' }}>
          {TITLES[tab]}
        </Text>
        {tab === 'history' && history.length > 0 && (
          <TouchableOpacity onPress={confirmClearHistory} style={{ padding: 6 }}>
            <MaterialIcons name="delete-sweep" size={26} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* SEARCH BAR (Browse only) */}
      {tab === 'browse' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 14,
            marginHorizontal: 16,
            marginBottom: 8,
            paddingHorizontal: 12,
          }}
        >
          <MaterialIcons name="search" size={22} color={colors.muted} />
          <TextInput
            style={{ flex: 1, color: colors.text, paddingVertical: 12, paddingHorizontal: 8 }}
            placeholder="Search manga..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => loadManga(searchText)}
            returnKeyType="search"
          />
          {searchText !== '' && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                loadManga('');
              }}
            >
              <MaterialIcons name="close" size={22} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* SOURCE + SORT + GENRE FILTER (Browse only) */}
      {tab === 'browse' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginRight: 8,
              marginBottom: 6,
            }}
          >
            <MaterialIcons name="public" size={14} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 4 }}>MangaDex</Text>
          </View>

          {activeQuery.trim() === '' &&
            [
              ['popular', 'Popular'],
              ['latest', 'Latest'],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => changeSort(key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                  marginBottom: 6,
                  backgroundColor: browseFilters.sort === key ? colors.accent : colors.card,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: browseFilters.sort === key ? 'black' : colors.text,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}

          {browseFilters.tag && (
            <TouchableOpacity
              onPress={clearTag}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 12,
                paddingRight: 8,
                paddingVertical: 6,
                borderRadius: 16,
                marginBottom: 6,
                backgroundColor: colors.accentSoft,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.accent }}>
                {browseFilters.tag.name}
              </Text>
              <MaterialIcons name="close" size={14} color={colors.accent} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {tab === 'history' && history.length > 0 && (
        <Text style={{ color: colors.muted, fontSize: 12, paddingHorizontal: 16, marginBottom: 4 }}>
          Hold a card to remove it
        </Text>
      )}

      {loadingNow && <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />}

      {errorText !== '' && (
        <TouchableOpacity
          onPress={() => (tab === 'trending' ? loadTrending() : loadManga(searchText))}
          style={{ alignItems: 'center', padding: 24 }}
        >
          <MaterialIcons name="cloud-off" size={40} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 8, textAlign: 'center' }}>{errorText}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <MaterialIcons name="refresh" size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, marginLeft: 4, fontWeight: 'bold' }}>Try again</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* THE GRID */}
      <FlatList
        key="grid"
        style={{ flex: 1 }}
        data={listData}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        contentContainerStyle={{ paddingBottom: 12 }}
        onEndReached={tab === 'browse' ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        refreshControl={
          tab === 'history' ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshCurrent}
              colors={[colors.accent]}
              tintColor={colors.accent}
              progressBackgroundColor={colors.surface}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.accent} style={{ margin: 16 }} /> : null
        }
        ListEmptyComponent={
          loadingNow || errorText !== '' ? null : (
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
              <MaterialIcons name={emptyIcon} size={56} color={colors.border} />
              <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
                {emptyText}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <MangaCard
            title={item.title}
            cover={tab === 'library' ? coverFor(item) : item.cover}
            badge={tab === 'library' && hasNew(item) ? 'NEW' : item.badge}
            width={cardWidth}
            onPress={() => (tab === 'trending' ? openFromTrending(item) : openManga(item))}
            onLongPress={() => {
              if (tab === 'history') removeFromHistory(item);
            }}
          />
        )}
      />

      {/* BOTTOM TAB BAR */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 22,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <View
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 4,
                  borderRadius: 16,
                  backgroundColor: active ? colors.accentSoft : 'transparent',
                }}
              >
                <MaterialIcons
                  name={t.icon}
                  size={24}
                  color={active ? colors.accent : colors.muted}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  marginTop: 2,
                  fontWeight: active ? 'bold' : 'normal',
                  color: active ? colors.accent : colors.muted,
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}