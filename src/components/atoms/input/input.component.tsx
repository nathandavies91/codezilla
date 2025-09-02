"use client";

import { InputProps } from "./input.types";

export const Input = (props: InputProps) => {
  return (
    <>
      <input {...props} />
      <style jsx>
        {`
          input {
            background: transparent;
            border: 0;
            color: inherit;
            font: inherit;
            outline: none;
            width: 100%;
          }
        `}
      </style>
    </>
  )
}