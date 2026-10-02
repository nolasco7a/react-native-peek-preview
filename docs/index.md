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

<div class="demo-grid">

<div class="demo-item">

### Peeking a list row

Hold a row: it lifts under your finger, the background blurs and dims, and the
preview expands from the item's own position into a centred card.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID"
    title="react-native-peek-preview — peeking a list row"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

</div>

<div class="demo-item">

### Scrolling inside the preview

Pass `preview` as a function to receive the resolved height ceiling, and the
content scrolls inside the card instead of being clipped.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID"
    title="react-native-peek-preview — scrolling inside the preview"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

</div>

<div class="demo-item">

### Actions

Up to three actions in a vertical glass menu, or spread across a row. Tapping
one runs it and dismisses the preview.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID"
    title="react-native-peek-preview — action menu"
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
  margin-bottom: 32px;
}
.demo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}
@media (min-width: 768px) {
  .demo-grid {
    grid-template-columns: repeat(3, 1fr);
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
