import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  BackHandler,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { usePeekPortal } from "./peek-preview-provider";

export type PeekBorderRadius = "none" | "small" | "medium" | "large";
export type PeekActionLayout = "list" | "row";

export interface PeekAction {
  label: string;
  onPress: () => void;
  /** Overrides the label color. Use for destructive actions (iOS systemRed is #FF3B30). */
  color?: string;
}

export interface PeekTheme {
  borderRadius?: PeekBorderRadius;
  /**
   * Ceiling for the preview. A value of 1 or less is a fraction of the space
   * available inside the safe area once the action menu is accounted for;
   * anything larger is absolute points. Defaults to all available space, and is
   * always clamped so neither the preview nor the menu can leave the safe area.
   */
  maxHeight?: number;
  /** Inset from the screen edges, in points. Defaults to 16. */
  margin?: number;
  actionLayout?: PeekActionLayout;
}

export interface PeekPreviewProps {
  /**
   * Expanded content. You control its layout, including whether it scrolls.
   * Pass a function to receive the resolved height ceiling, which is what a
   * ScrollView needs since it has no natural height of its own.
   */
  preview: React.ReactNode | ((maxHeight: number) => React.ReactNode);
  /** Collapsed content, rendered in place. */
  item: React.ReactNode;
  /** Up to 3 are rendered; extras are ignored. */
  actions?: PeekAction[];
  /**
   * Short press. React Native suppresses this once a long press has fired, so
   * it never competes with the preview.
   */
  onPress?: () => void;
  theme?: PeekTheme;
  /** Milliseconds to wait after the long press before the preview opens. */
  delay?: number;
  /** When false the long press is inert, so individual items can opt out. */
  showPreview?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

const DEFAULT_MARGIN = 16;
const GAP = 8;
const MAX_ACTIONS = 3;
const MENU_MIN_WIDTH = 160;
const MENU_MAX_WIDTH = 240;

// expo-blur only reaches RenderEffectBlur from API 31; below that it falls back
// to the deprecated RenderScript path, which is too slow for a full-screen blur.
// Gating here means RenderScript never runs, so the package stays usable on the
// Expo default minSdk (24) without a degraded frame rate.
const ANDROID_BLUR_API = 31;
const SUPPORTS_BLUR =
  Platform.OS === "ios" ||
  (Platform.OS === "android" &&
    typeof Platform.Version === "number" &&
    Platform.Version >= ANDROID_BLUR_API);

// Reanimated runs duration-based springs at 1.5x the stated duration, so these
// are the perceptual targets (400/250/300ms) divided by 1.5. Raising them back
// to round numbers makes the dismiss visibly linger.
const SPRING_PRESENT = { duration: 267, dampingRatio: 0.85 };
const SPRING_DISMISS = { duration: 167, dampingRatio: 1 };
const SPRING_RELEASE = { duration: 200, dampingRatio: 1 };

// Matches the default long-press threshold so the lift peaks as the press commits.
const LIFT_DURATION = 520;
const LIFT_SCALE = 1.04;

// On iOS `intensity` drives blur strength and UIKit fixes the material's own
// opacity. On Android it drives both: the tint alpha is intensity/100 * factor,
// so the same number reads far more opaque there.
const MENU_INTENSITY = Platform.OS === "android" ? 55 : 70;
const BACKDROP_INTENSITY = 32;

export function PeekPreview({
  preview,
  item,
  actions,
  onPress,
  theme,
  delay = 0,
  showPreview = true,
  onShow,
  onHide,
}: PeekPreviewProps) {
  const viewRef = useRef<View>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressProgress = useSharedValue(0);
  const { show, hide, blurTarget } = usePeekPortal();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  const handleLongPress = () => {
    if (!showPreview) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pressProgress.value = withSpring(0, SPRING_RELEASE);

    timeoutRef.current = setTimeout(() => {
      viewRef.current?.measureInWindow((x, y, w, h) => {
        onShow?.();
        show(
          <PeekOverlay
            preview={preview}
            origin={{ x, y, w, h }}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            actions={actions}
            theme={theme}
            blurTarget={blurTarget}
            onDismiss={() => {
              onHide?.();
              hide();
            }}
          />
        );
      });
    }, delay);
  };

  const handlePressIn = () => {
    pressProgress.value = withTiming(1, {
      duration: LIFT_DURATION,
      easing: Easing.bezier(0.4, 0, 0.3, 1),
    });
  };

  const handlePressOut = () => {
    pressProgress.value = withSpring(0, SPRING_RELEASE);
  };

  const liftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          pressProgress.value,
          [0, 1],
          [1, LIFT_SCALE],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={liftStyle}>
      <Pressable
        ref={viewRef}
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {item}
      </Pressable>
    </Animated.View>
  );
}

const borderRadiusFor = (size?: PeekBorderRadius): number => {
  switch (size) {
    case "none":
      return 0;
    case "small":
      return 10;
    case "large":
      return 28;
    case "medium":
    default:
      return 18;
  }
};

function PeekOverlay({
  preview,
  origin,
  screenWidth,
  screenHeight,
  actions,
  theme,
  blurTarget,
  onDismiss,
}: {
  preview: React.ReactNode | ((maxHeight: number) => React.ReactNode);
  origin: { x: number; y: number; w: number; h: number };
  screenWidth: number;
  screenHeight: number;
  actions?: PeekAction[];
  theme?: PeekTheme;
  blurTarget?: React.RefObject<View | null>;
  onDismiss: () => void;
}) {
  const progress = useSharedValue(0);
  const isAnimatingOut = useSharedValue(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [menuHeight, setMenuHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const borderRadius = borderRadiusFor(theme?.borderRadius);
  const margin = theme?.margin ?? DEFAULT_MARGIN;
  const isRow = theme?.actionLayout === "row";
  const visibleActions = actions?.slice(0, MAX_ACTIONS) ?? [];
  const hasMenu = visibleActions.length > 0;

  // Preview + gap + menu are laid out as one stack inside the safe region, so
  // neither piece can cross an inset edge regardless of where the row sits.
  const previewWidth = screenWidth - margin * 2;
  const regionTop = insets.top + margin;
  const regionHeight = screenHeight - insets.bottom - margin - regionTop;
  const menuBlock = hasMenu ? menuHeight + GAP : 0;

  // Everything the preview may occupy without pushing the menu past the inset.
  const available = Math.max(0, regionHeight - menuBlock);

  // A fraction resolves against that space; absolute points are clamped to it,
  // so no caller can place either piece outside the safe area.
  const requested = theme?.maxHeight;
  const maxHeight =
    requested === undefined
      ? available
      : Math.min(requested <= 1 ? available * requested : requested, available);

  const previewHeight = Math.max(0, Math.min(contentHeight, maxHeight));
  const stackTop =
    regionTop + Math.max(0, (regionHeight - (previewHeight + menuBlock)) / 2);
  const menuY = stackTop + previewHeight + GAP;

  // Targets depend on measurement, so hold the entrance until both are known.
  const measured = contentHeight > 0 && (!hasMenu || menuHeight > 0);
  React.useEffect(() => {
    if (measured) progress.value = withSpring(1, SPRING_PRESENT);
  }, [measured, progress]);

  const dismiss = React.useCallback(() => {
    if (isAnimatingOut.value) return;
    isAnimatingOut.value = true;
    progress.value = withSpring(0, SPRING_DISMISS, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  }, [isAnimatingOut, progress, onDismiss]);

  // The overlay lives in the React tree rather than a native Modal, so Android's
  // back press would otherwise navigate behind an open preview.
  React.useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => sub.remove();
  }, [dismiss]);

  const cardStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      left: interpolate(p, [0, 1], [origin.x, margin], Extrapolation.CLAMP),
      top: interpolate(p, [0, 1], [origin.y, stackTop], Extrapolation.CLAMP),
      width: interpolate(p, [0, 1], [origin.w, previewWidth], Extrapolation.CLAMP),
      height: interpolate(p, [0, 1], [origin.h, previewHeight], Extrapolation.CLAMP),
      borderRadius: interpolate(p, [0, 1], [10, borderRadius], Extrapolation.CLAMP),
      opacity: interpolate(p, [0, 0.12, 1], [0, 0.45, 1], Extrapolation.CLAMP),
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0, 1], Extrapolation.CLAMP),
  }));

  const menuStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      top: interpolate(
        p,
        [0, 1],
        [origin.y + origin.h + GAP, menuY],
        Extrapolation.CLAMP
      ),
      left: isRow ? margin : undefined,
      right: margin,
      opacity: interpolate(p, [0, 0.4, 1], [0, 0, 1], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(p, [0, 1], [0.88, 1], Extrapolation.CLAMP) }],
    };
  });

  // Android's BlurView paints its own tint over the blur, so the dim is pulled
  // back there to keep light mode from stacking into grey mud.
  const androidTinted = SUPPORTS_BLUR && Platform.OS === "android";
  const dimStyle = androidTinted
    ? isDark
      ? styles.dimTintedDark
      : styles.dimTinted
    : isDark
      ? styles.dimDark
      : styles.dim;

  const actionItems = visibleActions.map((action, idx) => (
    <Pressable
      key={idx}
      onPress={() => {
        action.onPress();
        dismiss();
      }}
      style={({ pressed }) => [
        styles.menuItem,
        isRow && styles.menuItemRow,
        pressed && (isDark ? styles.menuItemHeldDark : styles.menuItemHeld),
      ]}
    >
      <Text
        style={[
          styles.menuLabel,
          isDark && styles.menuLabelDark,
          isRow && styles.menuLabelRow,
          action.color ? { color: action.color } : null,
        ]}
      >
        {action.label}
      </Text>
    </Pressable>
  ));

  const surfaceStyle = [
    styles.menuSurface,
    isDark && styles.menuSurfaceDark,
    isRow ? styles.menuSurfaceRow : styles.menuSurfaceList,
  ];

  return (
    <View style={styles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
          {SUPPORTS_BLUR ? (
            <BlurView
              intensity={BACKDROP_INTENSITY}
              // Android tints from the same value, so a light tint would wash
              // the dim out. Dark composes with it instead of fighting it.
              tint={Platform.OS === "android" ? "dark" : isDark ? "dark" : "light"}
              blurMethod="dimezisBlurView"
              blurTarget={blurTarget}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={dimStyle} />
        </Pressable>
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.card, isDark && styles.cardDark, cardStyle]}
      >
        <Animated.View style={contentStyle}>
          <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
            {typeof preview === "function" ? preview(maxHeight) : preview}
          </View>
        </Animated.View>
      </Animated.View>

      {hasMenu && (
        <Animated.View
          onLayout={(e) => setMenuHeight(e.nativeEvent.layout.height)}
          style={[styles.menu, isRow ? styles.menuRow : styles.menuList, menuStyle]}
        >
          {SUPPORTS_BLUR ? (
            <BlurView
              intensity={MENU_INTENSITY}
              tint={isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
              blurMethod="dimezisBlurView"
              blurTarget={blurTarget}
              style={surfaceStyle}
            >
              {actionItems}
            </BlurView>
          ) : (
            // Without blur the surface needs its own fill, and because it now has
            // a background Android can finally draw an elevation shadow on it.
            <View
              style={[
                surfaceStyle,
                isDark ? styles.menuSolidDark : styles.menuSolid,
              ]}
            >
              {actionItems}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dimDark: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  dimTinted: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  dimTintedDark: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
  },
  card: {
    position: "absolute",
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
  },
  menu: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    // Android draws elevation shadows from a view's background outline, and the
    // blurred surface has none, so the shadow is left to the solid fallback.
    elevation: 0,
  },
  menuList: {
    minWidth: MENU_MIN_WIDTH,
    maxWidth: MENU_MAX_WIDTH,
    transformOrigin: "top right",
  },
  menuRow: {
    transformOrigin: "top center",
  },
  menuSurface: {
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.30)",
  },
  menuSurfaceDark: {
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  menuSurfaceList: {
    flexDirection: "column",
  },
  menuSurfaceRow: {
    flexDirection: "row",
  },
  menuSolid: {
    backgroundColor: "rgba(249, 249, 249, 0.94)",
    borderColor: "rgba(0, 0, 0, 0.08)",
    elevation: 8,
  },
  menuSolidDark: {
    backgroundColor: "rgba(37, 37, 37, 0.94)",
    borderColor: "rgba(255, 255, 255, 0.10)",
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemRow: {
    flex: 1,
    alignItems: "center",
  },
  menuItemHeld: {
    backgroundColor: "rgba(0, 0, 0, 0.07)",
  },
  menuItemHeldDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  menuLabel: {
    fontSize: 17,
    color: "#000",
    textAlign: "center",
  },
  menuLabelDark: {
    color: "#fff",
  },
  menuLabelRow: {
    fontSize: 15,
    textAlign: "center",
  },
});
