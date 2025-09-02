"use client";

import { WorkspaceItemBody } from "./body";
import { WorkspaceItemFooter } from "./footer";
import { WorkspaceItemHeader } from "./header";
import { WorkspaceItemProps } from "./workspace-item.types";

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
            display: flex;
            flex-direction: column;
            height: 100%;
            max-width: ${maxWidth ? `${maxWidth}px` : "auto"};
            min-width: ${minWidth ? `${minWidth}px` : "auto"};
            overflow: auto;
            resize: horizontal;
            width: 100%;
          }
        `}
      </style>
    </>
  )
}

WorkspaceItem.Body = WorkspaceItemBody;
WorkspaceItem.Footer = WorkspaceItemFooter;
WorkspaceItem.Header = WorkspaceItemHeader;
