# API

## `<PeekPreviewProvider>`

Hosts the overlay. Mount once, at the root of the app.

| Prop | Type | Notes |
| --- | --- | --- |
| `children` | `ReactNode` | Your app. On Android this is also the view that `expo-blur` samples. |

## `<PeekPreview>`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `item` | `ReactNode` | required | Collapsed content, rendered in place. |
| `preview` | `ReactNode \| (maxHeight: number) => ReactNode` | required | Expanded content. Pass a function to receive the resolved height ceiling — see [Sizing & Scrolling](/guide/sizing-and-scrolling). |
| `actions` | `PeekAction[]` | — | Up to 3 are rendered; extras ignored. |
| `theme` | `PeekTheme` | see below | Appearance and geometry. |
| `onPress` | `() => void` | — | Short press. Suppressed when a long press fires. |
| `delay` | `number` | `0` | Milliseconds after the long press before the preview opens. |
| `showPreview` | `boolean` | `true` | `false` makes the long press inert. |
| `onShow` | `() => void` | — | Fires when the preview opens. |
| `onHide` | `() => void` | — | Fires when it dismisses. |

## `PeekTheme`

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `borderRadius` | `'none' \| 'small' \| 'medium' \| 'large'` | `'medium'` | 0 / 10 / 18 / 28 pt. |
| `maxHeight` | `number` | all available | `<= 1` is a fraction of the usable space, `> 1` is points. Always clamped to the safe area. |
| `margin` | `number` | `16` | Inset from the screen edges, applied to both the preview and the menu. |
| `actionLayout` | `'list' \| 'row'` | `'list'` | `list` anchors bottom-right; `row` spreads across the preview width. |

## `PeekAction`

| Field | Type | Notes |
| --- | --- | --- |
| `label` | `string` | Button text. |
| `onPress` | `() => void` | Runs, then the preview dismisses. |
| `color` | `string` | Overrides the label colour. Reserve for destructive actions. |

## Motion

Not configurable, by design — these are the values the effect is built around.
They use Reanimated's `duration` + `dampingRatio` form, which maps directly onto
Apple's own spring parameters (`dampingRatio = 1 - bounce`).

| Phase | Perceptual target | Declared |
| --- | --- | --- |
| Present | 400ms, ratio 0.85 | `267` |
| Dismiss | 250ms, ratio 1 | `167` |
| Release | 300ms, ratio 1 | `200` |

The declared values are the targets divided by 1.5, because Reanimated runs
duration-based springs at 1.5× the stated duration. Rounding them back up makes
the dismiss visibly linger.

The pre-activation lift scales the item to 1.04 over 520ms, matching React
Native's default long-press threshold so the scale peaks as the press commits.
