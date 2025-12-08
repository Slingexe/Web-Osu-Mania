"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

type CapacitorPlatform = "web" | "android" | "ios";

export type CapacitorState = {
  isNative: boolean;
  platform: CapacitorPlatform;
};

const initialState: CapacitorState = {
  isNative: false,
  platform: "web",
};

export const readCapacitorState = (): CapacitorState => {
  if (typeof window === "undefined") {
    return initialState;
  }

  const isNative = Capacitor.isNativePlatform();
  const platform = isNative ? (Capacitor.getPlatform() as CapacitorPlatform) : "web";

  return {
    isNative,
    platform,
  };
};

export const isCapacitorNativeApp = (): boolean => readCapacitorState().isNative;

export const getCapacitorPlatform = (): CapacitorPlatform =>
  readCapacitorState().platform;

export const useCapacitorState = (): CapacitorState => {
  const [state, setState] = useState<CapacitorState>(initialState);

  useEffect(() => {
    setState(readCapacitorState());
  }, []);

  return state;
};
