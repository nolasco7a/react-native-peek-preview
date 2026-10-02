# Sizing & Scrolling

## The card is sized by your content

There is no fixed preview size. The card measures the natural height of whatever
you pass and animates to it, so short content gets a short card and nothing
leaves an empty gap.

`theme.maxHeight` is a **ceiling, not a height**. It only ever clips:

```tsx
// Content is 200pt tall, the cap allows 500 → the card is 200.
<PeekPreview theme={{ maxHeight: 500 }} preview={<Short />} item={<Row />} />
```

If you set a cap and see no change, the content is probably already shorter
than it.

### Fractions or points

A value of `1` or less is read as a fraction of the space actually available;
anything larger is absolute points.

```tsx
theme={{ maxHeight: 0.6 }}   // 60% of the usable space, on any screen
theme={{ maxHeight: 420 }}   // 420 points
```

Prefer the fraction. A point value means a different proportion on every
device — 450pt is about two thirds of an iPhone 16 Pro Max but nearly the whole
usable height of an SE.

### The cap can never break out of the safe area

Whatever you ask for is clamped to the space left once the safe-area insets and
the action menu are accounted for:

```
available = safeRegionHeight - (menuHeight + gap)
cap       = min(requested, available)
```

So `maxHeight: 5000` is not honoured, it is reduced. The preview and the menu
are laid out as one stack, which is what guarantees neither can cross an inset
edge regardless of where the item sits on screen.

## Scrolling

The preview is **not** wrapped in a `ScrollView`. That is deliberate: nesting
one inside another produces `VirtualizedList` warnings and makes the inner
scroll lose the first touch to the outer one. Scrolling is yours to add.

A `ScrollView` has no natural height of its own, so inside a container that
measures content it would collapse. Pass `preview` as a **function** to receive
the resolved ceiling and hand it a real height:

```tsx
<PeekPreview
  item={<Row />}
  preview={(maxHeight) => (
    <View style={{ height: maxHeight }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* … */}
      </ScrollView>
    </View>
  )}
  theme={{ maxHeight: 0.8 }}
/>
```

This is why the function form exists: it saves you from hardcoding a number and
keeping it in sync with `theme.maxHeight` by hand.

Content that exceeds the cap without a `ScrollView` is simply clipped, since the
card has `overflow: hidden`.
