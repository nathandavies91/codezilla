import { WorkspaceItemHeaderAlignment } from "./workspace-item-header.enums";
import { WorkspaceItemHeaderProps } from "./workspace-item-header.types";

export const WorkspaceItemHeader = ({
  alignment,
  flex,
  ...props
}: WorkspaceItemHeaderProps) => {
  return (
    <>
      <header {...props} />
      <style jsx>
        {`
          header {
            align-items: center;
            display: ${flex ? "flex" : "block"};
            gap: 1em;
            margin-left: ${alignment === WorkspaceItemHeaderAlignment.Right ? "auto" : "0"};
            margin-right: ${alignment === WorkspaceItemHeaderAlignment.Left ? "auto" : "0"};
            padding: 1em;
          }
        `}
      </style>
    </>
  )
}
