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
            display: block;
            height: 100%;
            margin: auto;
            transition: width .3s ease-in-out;
            width: 100%;
          }
        `}
      </style>
    </>
  )
}
