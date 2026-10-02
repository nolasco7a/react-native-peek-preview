# Actions

Up to **three** actions are rendered; extras are ignored. Tapping one runs its
`onPress` and dismisses the preview.

```tsx
const actions: PeekAction[] = [
  { label: 'Buy', onPress: buy },
  { label: 'Share', onPress: share },
  { label: 'Delete', onPress: remove, color: '#FF3B30' },
];
```

`color` overrides the label color. Follow the platform convention and reserve it
for destructive actions — iOS `systemRed` is `#FF3B30` in light mode and
`#FF453A` in dark.

Omit `actions` entirely and the preview renders alone, with the stack centred
and no space reserved for a menu.

## Layout

`theme.actionLayout` picks between two shapes.

### `list` (default)

A vertical glass panel anchored to the bottom-right of the preview, sized to its
longest label within a 160–240pt range.

```tsx
theme={{ actionLayout: 'list' }}
```

### `row`

One horizontal strip spanning the preview width, with each button taking an
equal share via `flex: 1`.

```tsx
theme={{ actionLayout: 'row' }}
```

Use `row` when the labels are short and you want the menu to read as a toolbar.
With three long labels the `list` stays more legible.

## Placement

The menu sits 8pt under the preview and is laid out as part of the same stack,
so it is included in the safe-area math — it cannot be pushed off screen by a
tall preview, because the preview's ceiling already accounts for the menu's
measured height.

The menu does not currently use separators between rows. iOS does, with the
translucent `separator` colour (`rgba(60,60,67,0.29)` light,
`rgba(84,84,88,0.60)` dark), if you want to match it more closely in a fork.
