import * as React from 'react';
import {
  StatusBar,
  FlatList,
  Image,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { api_key } from './config/config';

const API_KEY = api_key;

/** pexels.com is just used to fetch some random images just for the showcase
 * Read the documentation in pexels.com on how you can request for an api key
 **/
const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';

// width & height of the screen
const { width, height } = Dimensions.get('screen');

// image size of the small flat list
const IMAGE_SIZE = 80;

const _spacing = 10;

const fetchImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const { photos } = await data.json();
  return photos;
};

export default () => {
  const topFlatListRef = React.useRef<FlatList>(null);
  const bottomFlatListRef = React.useRef<FlatList>(null);
  const [images, setImages] = React.useState(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    let images;
    (async () => {
      images = await fetchImagesFromPexels();
      setImages(images);
    })();
  }, []);

  /**
   * Function that is called onMomentumScrollEnd of the
   * topFlatlist and on onPress of the bottom flatlist to set the state of the active index to current
   * index and to scroll the top flatlist to current index if it's called from the onPress of the bottom one
   * @param index | The current index that is calculated either by event.nativeEvent.offset.x for the top flatlist
   * or from bottom flat list index
   */
  const scrollToActiveIndex = index => {
    topFlatListRef.current?.scrollToOffset({
      offset: width * index,
      animated: true,
    });
    setActiveIndex(index);
  };

  React.useEffect(() => {
    bottomFlatListRef.current?.scrollToIndex({
      index: activeIndex,
      viewPosition: 0.5,
      animated: true,
    });
  }, [activeIndex]);

  if (!images) {
    return <Text>No images to show</Text>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar hidden />
      <FlatList
        ref={topFlatListRef}
        data={images}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={event => {
          scrollToActiveIndex(
            Math.floor(event.nativeEvent.contentOffset.x / width),
          );
        }}
        renderItem={({ item, index: topFlatListIndex }) => {
          return (
            <View style={{ width, height }}>
              <Image
                source={{ uri: item.src.portrait }}
                style={[StyleSheet.absoluteFillObject]}
              ></Image>
            </View>
          );
        }}
      />
      <FlatList
        ref={bottomFlatListRef}
        data={images}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: _spacing }}
        style={{ position: 'absolute', bottom: IMAGE_SIZE }}
        renderItem={({ item, index: secondFlatListIndex }) => {
          return (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={event => scrollToActiveIndex(secondFlatListIndex)}
            >
              <Image
                source={{ uri: item.src.portrait }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  marginRight: _spacing,
                  borderWidth: 2,
                  borderColor:
                    activeIndex === secondFlatListIndex
                      ? 'white'
                      : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};
