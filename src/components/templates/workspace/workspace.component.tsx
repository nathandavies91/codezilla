"use client";

import { WorkspaceItem } from "./item";
import { WorkspaceProps } from "./workspace.types";

export const Workspace = ({
  children,
  stackUntil = 0,
}: WorkspaceProps) => {
  return (
    <>
      <div className="container">
        <div className="workspace">
          {children}
        </div>
      </div>
      <style jsx>
        {`
          .container {
            container-name: workspace;
            container-type: inline-size;
            height: 100%;
            width: 100%;
          }
          
          .workspace {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;

            @container workspace (width > ${stackUntil}px) {
              flex-direction: row;
            }
          }
        `}
      </style>
    </>
  )
}

Workspace.Item = WorkspaceItem;
