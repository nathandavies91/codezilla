import { useMemo } from "react";

import { Icon, IconVariant } from "@/components/atoms/icon";

import { getIconByFilename } from "./file.helpers";
import { FileProps } from "./file.types";

export const File = ({
  onClick,
  name,
}: FileProps) => {
  const icon = useMemo(() => getIconByFilename(name), [name]);

  return (
    <>
      <div className="container" onClick={onClick}>
        <Icon variant={icon} />
        <span className="name">{name}</span>
      </div>
      <style jsx>
        {`
          .container {
            align-items: center;
            cursor: ${onClick ? "pointer" : "normal"};
            display: inline-flex;
            gap: .62em;
          }

          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}
      </style>
    </>
  )
}
