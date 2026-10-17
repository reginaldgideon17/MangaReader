import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { LANGS } from '../constants';
import { coverFor } from '../files';
import { sourceOf } from '../sources';

// MangaDex descriptions contain a little web-formatting. Tidy it up.
function cleanDescription(text) {
  return (text || '')
    .split('\n---')[0] // after "---" are usually just links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [words](link) -> words
    .replace(/[*_]{1,3}/g, '')
    .trim();
}

export default function DetailsScreen({
  chapterStatus,
  chapters,
  chooseLang,
  confirmDelete,
  goToGenre,
  goToSource,
  info,
  downloadChapter,
  downloadStatus,
  isDownloaded,
  lang,
  lastRead,
  library,
  openChapter,
  readIds,
  selected,
  setSelected,
  toggleLibrary,
}) {
  const [expanded, setExpanded] = useState(false);
  const inLibrary = library.some((m) => m.id === selected.id);
  const meta = { ...selected, ...(info || {}) }; // saved info + freshly fetched info
  const source = sourceOf(meta);
  const description = cleanDescription(meta.description);
  const tags = meta.tags || [];
  const statusText = meta.status ? meta.status.charAt(0).toUpperCase() + meta.status.slice(1) : '';
  const subtitle = [meta.author, meta.year, chapters.length > 0 ? chapters.length + ' chapters' : '']
    .filter(Boolean)
    .join('  ·  ');
  const known = selected.langs && selected.langs.length > 0;
  const filtered = known ? LANGS.filter((l) => selected.langs.includes(l.code)) : LANGS;
  const options = filtered.length > 0 ? filtered : LANGS;
  const resume = lastRead[selected.id];

  const header = (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Image
          source={{ uri: coverFor(selected) }}
          style={{ width: 110, height: 160, borderRadius: 12, backgroundColor: colors.border }}
        />
        <View style={{ flex: 1, marginLeft: 14, justifyContent: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }} numberOfLines={4}>
            {selected.title}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{subtitle || ' '}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => toggleLibrary(selected)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            borderRadius: 12,
            marginRight: resume ? 10 : 0,
            backgroundColor: inLibrary ? colors.card : colors.accent,
          }}
        >
          <MaterialIcons
            name={inLibrary ? 'bookmark' : 'bookmark-border'}
            size={20}
            color={inLibrary ? colors.accent : 'black'}
          />
          <Text
            style={{
              marginLeft: 6,
              fontWeight: 'bold',
              color: inLibrary ? colors.accent : 'black',
            }}
          >
            {inLibrary ? 'In library' : 'Add to library'}
          </Text>
        </TouchableOpacity>

        {resume && (
          <TouchableOpacity
            onPress={() => openChapter(resume)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.accent,
            }}
          >
            <MaterialIcons name="play-arrow" size={22} color={colors.accent} />
            <Text style={{ marginLeft: 4, fontWeight: 'bold', color: colors.accent }}>
              Continue Ch. {resume.number}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SOURCE (tap to see more from this source) */}
      <TouchableOpacity
        onPress={goToSource}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <MaterialIcons name={source.icon} size={22} color={colors.accent} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 11 }}>SOURCE</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{source.name}</Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 12 }}>More from here</Text>
        <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
      </TouchableOpacity>

      {/* STATUS + GENRES (tap a genre to find similar manga) */}
      {(statusText !== '' || tags.length > 0) && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {statusText !== '' && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.accent,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 12 }}>{statusText}</Text>
            </View>
          )}
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              onPress={() => goToGenre(tag)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: colors.card,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* DESCRIPTION */}
      {description !== '' && (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{ color: colors.muted, lineHeight: 20 }}
            numberOfLines={expanded ? undefined : 4}
          >
            {description}
          </Text>
          {description.length > 180 && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginTop: 4 }}>
              <Text style={{ color: colors.accent, fontWeight: 'bold' }}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MaterialIcons name="translate" size={18} color={colors.muted} />
        <Text style={{ color: colors.muted, marginLeft: 6 }}>Language</Text>
      </View>
      <View style={{ height: 38, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map((l) => (
            <TouchableOpacity
              key={l.code}
              onPress={() => chooseLang(l.code)}
              style={{
                paddingHorizontal: 14,
                justifyContent: 'center',
                borderRadius: 18,
                marginRight: 8,
                backgroundColor: lang === l.code ? colors.accent : colors.card,
              }}
            >
              <Text style={{ color: lang === l.code ? 'black' : colors.text }}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {chapterStatus !== '' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          {chapterStatus.startsWith('Loading') && (
            <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 8 }} />
          )}
          <Text style={{ color: colors.muted, flex: 1 }}>{chapterStatus}</Text>
        </View>
      )}
      {downloadStatus !== '' && (
        <Text style={{ color: colors.accent, marginBottom: 6 }}>{downloadStatus}</Text>
      )}

      <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginVertical: 8 }}>
        Chapters
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 44 }}>
      <TouchableOpacity
        onPress={() => setSelected(null)}
        style={{ paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' }}
      >
        <MaterialIcons name="arrow-back" size={26} color={colors.text} />
      </TouchableOpacity>

      <FlatList
        key="chapters"
        data={chapters}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const done = isDownloaded(item);
          const read = readIds[item.id];
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => openChapter(item)}
                style={{ flex: 1, paddingVertical: 12, paddingLeft: 14 }}
              >
                <Text
                  style={{
                    color: read ? colors.muted : colors.text,
                    fontWeight: 'bold',
                    fontSize: 15,
                  }}
                  numberOfLines={1}
                >
                  Chapter {item.number}
                  {item.title ? '  ·  ' + item.title : ''}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  {read && (
                    <MaterialIcons
                      name="check-circle"
                      size={14}
                      color={colors.muted}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  {done && (
                    <MaterialIcons
                      name="download-done"
                      size={14}
                      color={colors.accent}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {item.pages} pages{done ? '  ·  saved' : ''}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => (done ? confirmDelete(item) : downloadChapter(item))}
                style={{ padding: 14 }}
              >
                <MaterialIcons
                  name={done ? 'delete-outline' : 'file-download'}
                  size={24}
                  color={done ? colors.danger : colors.accent}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );

}