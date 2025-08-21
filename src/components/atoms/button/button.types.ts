import { ComponentProps, ReactNode } from "react";

export type ButtonProps = ComponentProps<"button"> & {
  children: ReactNode | ReactNode[];
  variant?: "flat" | "outlined" | "solid";
}
