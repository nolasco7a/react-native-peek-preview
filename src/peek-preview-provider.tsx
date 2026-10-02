import React, { createContext, useContext, useRef, useState, ReactNode } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurTargetView } from "expo-blur";

interface PeekPortalContext {
  show: (node: ReactNode) => void;
  hide: () => void;
  /**
   * What Android samples to produce its blur. iOS blurs through the native
   * UIVisualEffectView and ignores this, so it stays null there.
   */
  blurTarget: React.RefObject<View | null> | undefined;
}

const PeekPortal = createContext<PeekPortalContext | undefined>(undefined);

const IS_ANDROID = Platform.OS === "android";

/**
 * Hosts the peek overlay above the rest of the app. Mount it once, at the root,
 * so the overlay can cover navigation chrome.
 */
export function PeekPreviewProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode | null>(null);
  const blurTarget = useRef<View | null>(null);

  // expo-blur needs an explicit target view to sample on Android; without one
  // it falls back to no blur at all. iOS needs no wrapper, so it does not get
  // one and its tree stays exactly as it was.
  const content = IS_ANDROID ? (
    <BlurTargetView ref={blurTarget} style={styles.target}>
      {children}
    </BlurTargetView>
  ) : (
    children
  );

  return (
    <PeekPortal.Provider
      value={{
        show: setNode,
        hide: () => setNode(null),
        blurTarget: IS_ANDROID ? blurTarget : undefined,
      }}
    >
      {content}
      {node ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {node}
        </View>
      ) : null}
    </PeekPortal.Provider>
  );
}

export function usePeekPortal() {
  const context = useContext(PeekPortal);
  if (!context) {
    throw new Error("PeekPreview must be used inside a <PeekPreviewProvider>");
  }
  return context;
}

const styles = StyleSheet.create({
  target: {
    flex: 1,
  },
});
