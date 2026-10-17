import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

export default function MangaCard(props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      style={{
        width: props.width,
        margin: 8,
        backgroundColor: colors.card,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <View>
        <Image
          source={{ uri: props.cover }}
          style={{
            width: props.width,
            height: props.width * 1.45,
            backgroundColor: colors.border,
          }}
        />
        {props.badge ? (
          <View
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              backgroundColor: colors.accent,
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'black' }}>
              {props.badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={{ color: colors.text, fontSize: 12, padding: 8, height: 46 }}
        numberOfLines={2}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
}