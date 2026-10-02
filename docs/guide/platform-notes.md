# Platform Notes

The effect is tuned against iOS, which is where the materials and springs come
from. The package adapts at runtime rather than asking you to raise
`minSdkVersion`, but the two platforms are not identical and some of the
differences are worth knowing before you file a bug.

## Blur is gated to Android API 31+

`expo-blur` only reaches `RenderEffectBlur` from API 31. Below that it falls
back to the deprecated RenderScript path, which is too slow for a full-screen
blur. The package checks `Platform.Version` and, below 31, renders the menu as a
calibrated translucent surface and the backdrop as dim alone. **RenderScript
never runs.**

That means you can keep Expo's default `minSdkVersion` of 24 without a degraded
frame rate — the glass simply becomes a solid panel on older devices.

## `intensity` is not comparable across platforms

On iOS it drives blur strength while UIKit fixes the material's own opacity. On
Android it drives **both**: the tint alpha is derived from the same value
(`255 × intensity/100 × factor`). The same number therefore reads far more
opaque on Android, which is why the menu uses 70 on iOS and 55 on Android.

## The Android backdrop uses a dark tint in both colour schemes

Android paints its own tint over the blur. A light tint in light mode would wash
out the dim and produce grey mud, so Android composes a dark tint with a reduced
dim instead.

## The menu has no shadow on Android when blurred

Android draws elevation shadows from a view's background outline, and a blurred
surface has none. The solid fallback does get one, since it has a real
background. The hairline border carries the separation in the blurred case.

## The Android menu samples your app, not the dimmed backdrop

The backdrop lives inside the overlay, outside the view that `expo-blur`
samples. So the menu's glass blurs the undimmed app content and reads slightly
brighter than it does on iOS, where the material composes over whatever is
actually behind it. Lower the menu's intensity on Android if it bothers you.

## The hardware back button is wired explicitly

The overlay is a view in the React tree, not a native `Modal`, so Android's back
press would otherwise navigate behind an open preview. The package registers a
`BackHandler` to dismiss it instead. This is Android-only; iOS has no
equivalent.

## Haptics are advisory

`impactAsync(Medium)` is a precise taptic on iOS and a coarse buzz on most
Android devices. If the user has disabled system haptics it is a silent no-op.
The preview still opens either way.
