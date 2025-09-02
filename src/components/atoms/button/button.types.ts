import { OneOrMore } from "@/types/one-or-more.type";
import { ComponentProps, ReactNode } from "react";

export type ButtonProps = ComponentProps<"button"> & {
  children: OneOrMore<ReactNode>;
  variant?: "flat" | "outlined" | "solid";
}
