"use client";

import { ButtonProps } from "./button.types";

export const Button = ({
  children,
  variant,
  ...props
}: ButtonProps) => {
  return (
    <>
      <button {...props}>
        {children}
      </button>
      <style jsx>
        {`
          button {
            background: ${variant === "solid" ? "red" : "transparent"};
            border: ${variant === "flat" ? "0" : "2px solid red"};
            color: ${variant === "flat" ? "inherit" : "red"};
            cursor: pointer;
            font: inherit;
            padding: ${variant === "flat" ? "0" : ".62em 1em"};

            &[disabled] {
              cursor: not-allowed;
              opacity: .6;
            }
          }
        `}
      </style>
    </>
  )
}
