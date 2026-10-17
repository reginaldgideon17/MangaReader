import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';

export default function PageImage(props) {
  const [height, setHeight] = useState(props.width * 1.4);

  useEffect(() => {
    if (props.fixedHeight) return;
    let active = true;

    Image.getSize(
      props.uri,
      (w, h) => {
        if (active && w > 0) setHeight((h / w) * props.width);
      },
      () => {}
    );

    return () => {
      active = false;
    };
  }, [props.uri, props.width, props.fixedHeight]);

  return (
    <Image
      source={{ uri: props.uri }}
      style={{ width: props.width, height: props.fixedHeight || height }}
      resizeMode="contain"
    />
  );
}