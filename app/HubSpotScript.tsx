"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function HubSpotScript() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const blockedEvents: Array<keyof WindowEventMap> = ["beforeunload", "unload"];
    const blockedProps = ["onbeforeunload", "onunload"] as const;
    const originalAddEventListener = window.addEventListener;

    const patchedAddEventListener: typeof window.addEventListener = function (
      type,
      listener,
      options
    ) {
      if (blockedEvents.includes(type as keyof WindowEventMap)) {
        return;
      }
      return originalAddEventListener.call(
        this,
        type,
        listener as EventListenerOrEventListenerObject,
        options as boolean | AddEventListenerOptions | undefined
      );
    };

    window.addEventListener = patchedAddEventListener;

    const originalDescriptors = blockedProps.map((prop) => ({
      prop,
      descriptor: Object.getOwnPropertyDescriptor(window, prop),
    }));

    blockedProps.forEach((prop) => {
      try {
        Object.defineProperty(window, prop, {
          configurable: true,
          enumerable: false,
          get: () => null,
          set: () => undefined,
        });
      } catch {
        // Ignore if the browser does not allow redefining the property.
      }
    });

    return () => {
      window.addEventListener = originalAddEventListener;
      originalDescriptors.forEach(({ prop, descriptor }) => {
        if (descriptor) {
          Object.defineProperty(window, prop, descriptor);
        } else {
          delete (window as any)[prop];
        }
      });
    };
  }, []);

  return (
    <Script
      id="hubspot-script"
      src="//js-eu1.hs-scripts.com/147219365.js"
      strategy="lazyOnload"
      async
      defer
    />
  );
}
