import { ComponentProps } from "react";
import { IconType } from "react-icons";

export type IconProps = ComponentProps<"svg"> & {
  variant: IconType;
}
