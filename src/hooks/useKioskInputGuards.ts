import { useEffect } from "react";

export function useKioskInputGuards() {
  useEffect(() => {
    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const touchOptions: AddEventListenerOptions = {
      passive: false,
    };

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("dragstart", preventDefault);
    document.addEventListener("selectstart", preventDefault);
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);
    document.addEventListener("gestureend", preventDefault);
    document.addEventListener(
      "touchstart",
      preventMultiTouch,
      touchOptions,
    );
    document.addEventListener(
      "touchmove",
      preventMultiTouch,
      touchOptions,
    );

    return () => {
      document.removeEventListener(
        "contextmenu",
        preventDefault,
      );
      document.removeEventListener("dragstart", preventDefault);
      document.removeEventListener("selectstart", preventDefault);
      document.removeEventListener(
        "gesturestart",
        preventDefault,
      );
      document.removeEventListener(
        "gesturechange",
        preventDefault,
      );
      document.removeEventListener("gestureend", preventDefault);
      document.removeEventListener(
        "touchstart",
        preventMultiTouch,
        touchOptions,
      );
      document.removeEventListener(
        "touchmove",
        preventMultiTouch,
        touchOptions,
      );
    };
  }, []);
}
