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
            background: ${variant === "solid" ? "var(--button-background)" : "transparent"};
            border: ${variant === "flat" ? "0" : "2px solid var(--button-background)"};
            border-radius: .31em;
            color: ${variant === "solid" ? "var(--button-color)" : "inherit"};
            cursor: pointer;
            display: inline-flex;
            font: inherit;
            font-weight: bold;
            padding: ${variant === "flat" ? "0" : ".31em .62em"};

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
