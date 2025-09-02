import { IconProps } from "./icon.types";

export const Icon = ({
  variant: Variant,
  ...props
}: IconProps) => {
  return (
    <Variant className="icon" {...props} />
  );
};
