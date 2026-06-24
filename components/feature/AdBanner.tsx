import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import {
  AD_BANNER_INTERVAL_MS,
  AdBannerItem,
  getActiveAdBanners,
} from '@/constants/adminSettings';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

interface Props {
  onPressBanner?: (banner: AdBannerItem) => void;
  // Width override (optional). Defaults to the available screen width.
  width?: number;
  // Card height in pixels.
  height?: number;
}

/**
 * Admin-controlled auto-scrolling advertising banner.
 * Banners are sourced from `AD_BANNERS` in `constants/adminSettings.ts`.
 */
export function AdBanner({ onPressBanner, width, height = 180 }: Props) {
  const banners = getActiveAdBanners();
  const initialWidth = width ?? Math.max(280, Dimensions.get('window').width - spacing.lg * 2);
  const [containerW, setContainerW] = useState<number>(initialWidth);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<AdBannerItem>>(null);
  const pausedUntilRef = useRef<number>(0);

  // Re-measure when the container layout changes (orientation / resize).
  const handleLayout = (e: any) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== containerW) setContainerW(w);
  };

  // Auto-advance every AD_BANNER_INTERVAL_MS unless paused by user touch.
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActiveIndex((cur) => {
        const next = (cur + 1) % banners.length;
        listRef.current?.scrollToOffset({
          offset: next * containerW,
          animated: true,
        });
        return next;
      });
    }, AD_BANNER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [banners.length, containerW]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first && typeof first.index === 'number') {
        setActiveIndex(first.index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleScrollBegin = () => {
    // Pause auto-scroll briefly when user interacts.
    pausedUntilRef.current = Date.now() + AD_BANNER_INTERVAL_MS * 2;
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, containerW));
    setActiveIndex(Math.max(0, Math.min(idx, banners.length - 1)));
  };

  if (banners.length === 0) return null;

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={containerW}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleMomentumEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_data, index) => ({
          length: containerW,
          offset: containerW * index,
          index,
        })}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPressBanner?.(item)}
            style={[styles.slide, { width: containerW, height }]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={250}
            />
            <View style={styles.overlay} />
            {(item.titleAr || item.subtitleAr) ? (
              <View style={styles.captionWrap}>
                {item.titleAr ? <Text style={styles.title}>{item.titleAr}</Text> : null}
                {item.subtitleAr ? (
                  <Text style={styles.subtitle}>{item.subtitleAr}</Text>
                ) : null}
              </View>
            ) : null}
          </Pressable>
        )}
      />
      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    ...shadows.card,
  },
  slide: { position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  captionWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: '#fff',
    textAlign: 'right',
  },
  subtitle: {
    ...typography.body,
    color: '#FFF7DA',
    marginTop: 4,
    textAlign: 'right',
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
});
