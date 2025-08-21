"use client";

import { InputProps } from "./input.types";

export const Input = (props: InputProps) => {
  return (
    <>
      <input {...props} />
      <style jsx>
        {`
          input {
            background: white;
            border: 0;
            border-radius: 2em;
            color: black;
            font: inherit;
            padding: .62em 1em;
            width: 100%;
          }
        `}
      </style>
    </>
  )
}