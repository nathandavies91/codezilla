"use client";

import { IframeProps } from "./iframe.types";

export const Iframe = (props: IframeProps) => {
  return (
    <>
      <iframe {...props} />
      <style jsx>
        {`
          iframe {
            border: 0;
            height: 100vh;
            width: 100%;
          }
        `}
      </style>
    </>
  )
}
