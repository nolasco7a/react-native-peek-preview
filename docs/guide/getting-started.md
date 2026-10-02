# Getting Started

## Install

```sh
npm install @nolasco7a/react-native-peek-preview
```

The package ships no native code of its own, but it leans on four peers:

```sh
npx expo install expo-blur expo-haptics react-native-reanimated react-native-safe-area-context
```

Outside Expo, run `npx install-expo-modules` first — `expo-blur` and
`expo-haptics` are Expo modules and need `expo-modules-core` present.

## Requirements

| | Minimum | Why |
| --- | --- | --- |
| React Native | 0.73 | `transformOrigin` |
| Reanimated | 3.0 | `withSpring({ duration, dampingRatio })` |
| iOS | 15.1 | inherited from Expo modules |
| Android | API 24 runs, 31 for the glass | `RenderEffectBlur` starts at 31 |

Reanimated 4 requires React Native 0.78+ and the New Architecture. Staying on
Reanimated 3 keeps old-architecture apps working; this package supports both.

## Mount the provider

The overlay renders above the rest of the app, so the provider goes once at the
root — high enough to cover navigation chrome.

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

On Android the provider also wraps your app in the target view that `expo-blur`
samples to produce its blur. Without it there is nothing to blur, so the
provider is not optional on that platform.

## Wrap something

`item` is what renders in place; `preview` is what it expands into. You own the
layout of both.

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
  onPress={() => router.push(`/product/${product.id}`)}
  theme={{ borderRadius: 'large', maxHeight: 0.8 }}
/>
```

That is the whole surface. `onPress` fires on a short tap and React Native
suppresses it once a long press has fired, so the two never compete.

## Opting out per item

Some items in a list may have nothing worth previewing. `showPreview={false}`
makes the long press inert while leaving `onPress` working.

```tsx
<PeekPreview
  item={<Row />}
  preview={<Detail />}
  showPreview={item.hasDetail}
  onPress={open}
/>
```
