import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import PageImage from '../components/PageImage';

export default function ReaderScreen({
  chapters,
  currentPage,
  onViewable,
  openChapter,
  pages,
  readMode,
  readerStatus,
  reading,
  screenHeight,
  screenWidth,
  selected,
  setReading,
  setShowBar,
  showBar,
  toggleReadMode,
  viewConfig,
}) {
  const index = chapters.findIndex((c) => c.id === reading.id);
  const next = index >= 0 ? chapters[index + 1] : null;
  const paged = readMode === 'paged';

  const footer =
    pages.length === 0 ? null : next ? (
      <TouchableOpacity
        onPress={() => openChapter(next)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: colors.accent,
        }}
      >
        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Next chapter</Text>
        <MaterialIcons name="skip-next" size={24} color="black" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    ) : (
      <View style={{ alignItems: 'center', margin: 32 }}>
        <MaterialIcons name="check-circle" size={32} color={colors.accent} />
        <Text style={{ color: colors.muted, marginTop: 8 }}>You're all caught up</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <FlatList
        key={'pages-' + reading.id + '-' + readMode}
        horizontal={paged}
        pagingEnabled={paged}
        data={pages}
        keyExtractor={(uri) => uri}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig}
        ListFooterComponent={
          paged && footer ? (
            <View style={{ width: screenWidth, height: screenHeight, justifyContent: 'center' }}>
              {footer}
            </View>
          ) : (
            footer
          )
        }
        renderItem={({ item }) => (
          <TouchableWithoutFeedback onPress={() => setShowBar(!showBar)}>
            <View>
              <PageImage
                uri={item}
                width={screenWidth}
                fixedHeight={paged ? screenHeight : undefined}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      />

      {/* loading / error message in the middle */}
      {(readerStatus.startsWith('Loading') || readerStatus.startsWith('Something')) && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {readerStatus.startsWith('Loading') ? (
            <ActivityIndicator size="large" color={colors.accent} />
          ) : (
            <>
              <MaterialIcons name="cloud-off" size={40} color={colors.muted} />
              <Text style={{ color: colors.muted, marginTop: 8, textAlign: 'center' }}>
                {readerStatus}
              </Text>
            </>
          )}
        </View>
      )}

      {/* TOP BAR (tap a page to hide / show it) */}
      {showBar && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 44,
            paddingBottom: 8,
            paddingHorizontal: 8,
            backgroundColor: 'rgba(16,17,20,0.93)',
          }}
        >
          <TouchableOpacity onPress={() => setReading(null)} style={{ padding: 8 }}>
            <MaterialIcons name="arrow-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 4 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>
              {selected ? selected.title : ''}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Chapter {reading.number}
              {readerStatus === 'Reading saved copy' ? '  ·  saved copy' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleReadMode}
            style={{ alignItems: 'center', paddingHorizontal: 10 }}
          >
            <MaterialIcons
              name={paged ? 'view-agenda' : 'view-carousel'}
              size={24}
              color={colors.accent}
            />
            <Text style={{ color: colors.accent, fontSize: 10 }}>{paged ? 'Scroll' : 'Pages'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PAGE COUNTER */}
      {pages.length > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 24,
            alignSelf: 'center',
            backgroundColor: 'rgba(16,17,20,0.85)',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 12 }}>
            {Math.min(currentPage, pages.length)} / {pages.length}
          </Text>
        </View>
      )}
    </View>
  );

}