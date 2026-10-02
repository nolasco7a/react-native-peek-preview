---
layout: home

hero:
  name: react-native-peek-preview
  text: The iOS peek, as a wrapper
  tagline: Long-press anything and it lifts into a floating card over a blurred backdrop, with a glass action menu that never leaves the safe area. Built on Reanimated, no native module of its own.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/nolasco7a/react-native-peek-preview

features:
  - title: Wraps anything
    details: "Rows, cards, tiles, images — you pass the collapsed item and the expanded preview, and own the layout of both. The package handles the choreography, not your content."
  - title: Safe area aware
    details: "Preview and action menu are laid out as a single stack inside the safe region, so neither can cross an inset edge no matter where the item sits on screen."
  - title: Apple's motion
    details: "Spring values derived from Apple's own duration/dampingRatio form, with the pre-activation lift ramped over the long-press window."
  - title: Real glass
    details: "The action menu uses the systemChromeMaterial blur on iOS, with a calibrated translucent fallback where Android cannot blur cheaply."
  - title: Content-sized, capped
    details: "The card shrinks to whatever you pass. maxHeight is a ceiling, expressed as a fraction of the usable space or in points, and it is always clamped to the safe area."
  - title: Short and long press
    details: "onPress for navigating to a detail view, long press for the peek. React Native suppresses the former once the latter fires, so they never compete."
---

<div class="demo-section">

## See it in action

Recorded on a physical iPhone and a physical Android device, same code, same
props — only the platform differs.

### iOS

<div class="demo-grid">

<div class="demo-item">

#### List rows

Hold a row and it lifts under your finger while the background blurs and dims.
The preview expands from the row's own position and the glass menu settles
underneath it.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/ghyonk3sI-g"
    title="react-native-peek-preview on iOS — peeking a list row"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

</div>

<div class="demo-item">

#### Cards

The same component wrapping cards instead of rows, with the preview scrolling
inside the card and each case using a different `theme`.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/mTPEQSoivPc"
    title="react-native-peek-preview on iOS — peeking cards"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

</div>

</div>

### Android

<div class="demo-grid">

<div class="demo-item">

#### List rows

Same effect through `RenderEffectBlur`, with the backdrop composing a dark tint
instead of a light one so the dim does not wash out.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/04saEaaW1T0"
    title="react-native-peek-preview on Android — peeking a list row"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

</div>

<div class="demo-item">

#### Cards

Cards on Android, including the hardware back button dismissing the preview
rather than navigating behind it.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/NqIojjwWEFo"
    title="react-native-peek-preview on Android — peeking cards"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

</div>

</div>

</div>

<style>
.demo-section {
  max-width: 1152px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}
.demo-section h2 {
  text-align: center;
  margin-bottom: 12px;
}
.demo-section h3 {
  margin: 40px 0 24px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
}
.demo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}
@media (min-width: 768px) {
  .demo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.video-embed {
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.video-embed iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
