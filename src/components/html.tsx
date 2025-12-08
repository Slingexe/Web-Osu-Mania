"use client";

import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { StatusBar, Style } from "@capacitor/status-bar";
import { readCapacitorState } from "@/lib/capacitorPlatform";
import { useSettingsStore } from "@/stores/settingsStore";
import { Howler } from "howler";
import { CSSProperties, ReactNode, useEffect } from "react";

const hslToHex = (h: number, s: number, l: number) => {
  const saturation = s / 100;
  const lightness = l / 1200;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
};

const Html = ({ children }: { children: ReactNode }) => {
  const hue = useSettingsStore.use.hue();
  const volume = useSettingsStore.use.volume();

  useEffect(() => {
    Howler.volume(volume);
  }, [volume]);

  useEffect(() => {
    const root = document.documentElement;
    const applyCapacitorMetadata = () => {
      const { isNative, platform } = readCapacitorState();

      root.classList.remove("capacitor-platform-android", "capacitor-platform-ios");

      if (!isNative) {
        root.classList.remove("capacitor-native");
        root.removeAttribute("data-capacitor-platform");
        root.style.removeProperty("--android-safe-area-top");
        root.style.removeProperty("--android-safe-area-bottom");
        return false;
      }

      root.classList.add("capacitor-native");
      root.setAttribute("data-capacitor-platform", platform);
      if (platform !== "web") {
        root.classList.add(`capacitor-platform-${platform}`);
      }
      if (platform !== "android") {
        root.style.removeProperty("--android-safe-area-top");
        root.style.removeProperty("--android-safe-area-bottom");
      }
      return platform === "android";
    };

    const shouldHandleInsets = applyCapacitorMetadata();

    if (!shouldHandleInsets) {
      return () => {
        root.classList.remove("capacitor-native");
        root.removeAttribute("data-capacitor-platform");
        root.classList.remove("capacitor-platform-android", "capacitor-platform-ios");
      };
    }

    const updateInsets = () => {
      const viewport = window.visualViewport;

      if (!viewport) {
        root.style.setProperty("--android-safe-area-top", "16px");
        root.style.setProperty("--android-safe-area-bottom", "16px");
        return;
      }

      const top = Math.max(viewport.offsetTop, 0);
      const bottom = Math.max(
        window.innerHeight - viewport.height - viewport.offsetTop,
        0,
      );

      root.style.setProperty("--android-safe-area-top", `${Math.ceil(top)}px`);
      root.style.setProperty(
        "--android-safe-area-bottom",
        `${Math.ceil(bottom)}px`,
      );
    };

    updateInsets();

    const viewport = window.visualViewport;

    const handleResize = () => {
      applyCapacitorMetadata();
      updateInsets();
    };

    viewport?.addEventListener("resize", handleResize);
    viewport?.addEventListener("scroll", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      viewport?.removeEventListener("resize", handleResize);
      viewport?.removeEventListener("scroll", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      root.classList.remove("capacitor-native");
      root.removeAttribute("data-capacitor-platform");
      root.classList.remove("capacitor-platform-android", "capacitor-platform-ios");
      root.style.removeProperty("--android-safe-area-top");
      root.style.removeProperty("--android-safe-area-bottom");
    };
  }, []);

  useEffect(() => {
    const { isNative, platform } = readCapacitorState();
    if (!isNative || platform !== "android") {
      return;
    }

    const statusBarColor = hslToHex(hue, 80, 69);

    const applyStatusBarAppearance = async () => {
      try {
        await EdgeToEdge.enable();
        await EdgeToEdge.setBackgroundColor({ color: statusBarColor });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (error) {
        console.warn("Failed to update status bar appearance", error);
      }
    };

    void applyStatusBarAppearance();
  }, [hue]);

  return (
    <html
      lang="en"
      className="scrollbar scrollbar-track-background scrollbar-thumb-primary"
      style={
        {
          "--hue": hue,
        } as CSSProperties
      }
    >
      {children}
    </html>
  );
};

export default Html;
