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
