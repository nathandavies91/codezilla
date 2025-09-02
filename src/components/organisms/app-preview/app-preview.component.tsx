"use client";

import { useMemo, useState, forwardRef, useImperativeHandle } from "react";

import { Iframe } from "@/components/atoms/iframe";

import { AppPreviewHandle, AppPreviewProps } from "./app-preview.types";
import { AppPreviewSize } from "./app-preview.enums";

export const AppPreview = forwardRef<AppPreviewHandle, AppPreviewProps>(({
  appBaseUrl,
}, ref) => {
  const [route, setRoute] = useState("/");
  const [size, setSize] = useState(AppPreviewSize.Full);
  
  useImperativeHandle(ref, () => ({
    updateRoute: (newRoute: string) => {
      setRoute(newRoute);
    },
    updateSize: (newSize: AppPreviewSize) => {
      setSize(newSize);
    },
  }));

  const containerUrl = useMemo(() => {
    const newRoute = route.startsWith("/") ? route : `/${route}`;
    return `${appBaseUrl}${newRoute}`;
  }, [route]);

  return (
    <>
      <div>
        <Iframe
          key={containerUrl} // Force reload when URL changes
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          src={containerUrl}
          style={{
            width: size,
          }}
        />
      </div>
      <style jsx>
        {`
          div {
            background-image: linear-gradient(-45deg, var(--background) 25%, transparent 25%, transparent 50%, var(--background) 50%, var(--background) 75%, transparent 75%, var(--accent));
            background-size: 4px 4px;
            height: 100%;
          }
        `}
      </style>
    </>
);
});
