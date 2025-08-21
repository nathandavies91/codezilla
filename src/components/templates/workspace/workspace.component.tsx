"use client";

import { WorkspaceItem } from "./workspace-item.component";
import { WorkspaceProps } from "./workspace.types";

export const Workspace = ({
  children,
}: WorkspaceProps) => {
  return (
    <>
      <div className="container">
        {children}
      </div>
      <style jsx>
        {`
          .container {
            border-top: 2px solid var(--border-color);
            display: flex;
            height: 100%;
          }
        `}
      </style>
    </>
  )
}

Workspace.Item = WorkspaceItem;
