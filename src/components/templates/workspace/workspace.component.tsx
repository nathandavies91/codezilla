"use client";

import { WorkspaceItem } from "./item";
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
            display: flex;
            height: 100%;
            width: 100%;
          }
        `}
      </style>
    </>
  )
}

Workspace.Item = WorkspaceItem;
