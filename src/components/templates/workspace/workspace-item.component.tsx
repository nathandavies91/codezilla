"use client";

import { WorkspaceItemProps } from "./workspace.types";

export const WorkspaceItem = ({
  children,
  maxWidth,
  minWidth,
}: WorkspaceItemProps) => {
  return (
    <>
      <div className="workspace-item container">
        {children}
      </div>
      <style jsx>
        {`
          .container {
            background: var(--accent);
            flex: 1 1 auto;
            max-width: ${maxWidth ? `${maxWidth}px` : "auto"};
            min-width: ${minWidth ? `${minWidth}px` : "auto"};
            overflow: auto;
            resize: horizontal;
          }
        `}
      </style>
      <style jsx global>
        {`
          .workspace-item {
            + & {
              border-left: 3px solid var(--border-color);
            }
          }
        `}
      </style>
    </>
  )
}