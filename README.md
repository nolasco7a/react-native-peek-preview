# react-native-peek-preview

iOS-style long-press peek preview for React Native. Hold an item, it lifts and
expands into a floating card over a blurred backdrop, with an optional glass
action menu. Built on Reanimated — no native module of its own.

## Install

```sh
npm install @nolasco7a/react-native-peek-preview
```

Peer dependencies:

```sh
npx expo install expo-blur expo-haptics react-native-reanimated react-native-safe-area-context
```

## Requirements

| | Minimum | Why |
| --- | --- | --- |
| React Native | 0.73 | `transformOrigin` |
| iOS | 15.1 | inherited from Expo modules |
| Android | API 24 runs, **API 31 for the glass** | `RenderEffectBlur` starts at 31 |
| Reanimated | 3.0 | `withSpring({ duration, dampingRatio })` |

Reanimated 4 requires React Native 0.78+ and the New Architecture. Staying on
Reanimated 3 keeps old-architecture apps working; this package supports both.

## Usage

Mount the provider once, at the root, so the overlay can cover navigation chrome:

```tsx
import { PeekPreviewProvider } from '@nolasco7a/react-native-peek-preview';

export default function RootLayout() {
  return (
    <PeekPreviewProvider>
      <Stack />
    </PeekPreviewProvider>
  );
}
```

Then wrap anything you want to be peekable:

```tsx
import { PeekPreview, PeekAction } from '@nolasco7a/react-native-peek-preview';

const actions: PeekAction[] = [
  { label: 'Buy', onPress: buy },
  { label: 'Share', onPress: share },
  { label: 'Delete', onPress: remove, color: '#FF3B30' },
];

<PeekPreview
  item={<ProductRow product={product} />}
  preview={<ProductDetail product={product} />}
  actions={actions}
  theme={{ borderRadius: 'large', maxHeight: 0.8, actionLayout: 'list' }}
/>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `item` | `ReactNode` | required | Collapsed content, rendered in place. |
| `preview` | `ReactNode \| (maxHeight) => ReactNode` | required | Expanded content. You own its layout. Pass a function to receive the resolved height ceiling. |
| `actions` | `PeekAction[]` | — | Up to 3 are rendered; extras ignored. |
| `onPress` | `() => void` | — | Short press, e.g. navigate to a detail view. Suppressed when a long press fires. |
| `theme.borderRadius` | `none \| small \| medium \| large` | `medium` | 0 / 10 / 18 / 28 pt. |
| `theme.maxHeight` | `number` | all available | `<= 1` is a fraction of the usable space, `> 1` is points. Always clamped to the safe area. |
| `theme.margin` | `number` | `16` | Inset from the screen edges. |
| `theme.actionLayout` | `list \| row` | `list` | `list` anchors bottom-right; `row` spreads across the preview width. |
| `delay` | `number` | `0` | Milliseconds after the long press before opening. |
| `showPreview` | `boolean` | `true` | `false` makes the long press inert. |
| `onShow` / `onHide` | `() => void` | — | Lifecycle hooks. |

### Sizing and scrolling

The card is sized from the natural height of what you pass, so short content
gets a short card. `theme.maxHeight` only ever clips: it is a ceiling, not a
fixed height, and it is clamped so the preview and the action menu always stay
inside the safe area — an absolute value larger than the available space is
reduced, never honoured.

The preview is not wrapped in a `ScrollView`, which avoids nested-scroll gesture
conflicts and keeps layout yours. A `ScrollView` has no natural height, so give
it one by passing `preview` as a function:

```tsx
<PeekPreview
  item={<Row />}
  preview={(maxHeight) => (
    <View style={{ height: maxHeight }}>
      <ScrollView>{/* … */}</ScrollView>
    </View>
  )}
  theme={{ maxHeight: 0.8 }}
/>
```

## Platform notes

Tuned against iOS. The package adapts at runtime rather than requiring a high
`minSdkVersion`:

- **Blur is gated to Android API 31+.** Below that, `expo-blur` would fall back
  to the deprecated RenderScript path, which is too slow for a full-screen
  blur, so the menu renders as a solid translucent surface instead and the
  backdrop uses only the dim. RenderScript never runs.
- **`intensity` is not comparable across platforms.** On iOS it drives blur
  strength while UIKit fixes the material opacity; on Android it drives both,
  so the same number reads far more opaque. The menu uses 70 on iOS, 55 on
  Android.
- **The Android backdrop uses a dark tint in both color schemes**, because
  Android paints its own tint over the blur and a light one would wash out the
  dim. The dim is reduced there to compensate.
- **The menu has no shadow on Android when blurred.** Android draws elevation
  shadows from a view's background outline, and a blurred surface has none.
  The solid fallback does get one.
- **Android's hardware back button dismisses the preview.** The overlay is not
  a native `Modal`, so this is wired explicitly via `BackHandler`.

## License

MIT
