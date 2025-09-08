"use client";

import { WorkspaceItem } from "./item";
import { WorkspaceProps } from "./workspace.types";

export const Workspace = ({
  children,
  hasDivider,
  stackUntil = 0,
}: WorkspaceProps) => {
  return (
    <>
      <div className="container">
        <div className={`workspace ${hasDivider && "workspace--divider"}`}>
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
            gap: 2px;
            height: 100%;
            width: 100%;

            @container workspace (width > ${stackUntil}px) {
              flex-direction: row;
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          .workspace--divider > * {
            box-shadow: 0 0 2px var(--border-color);
          }
        `}
      </style>
    </>
  )
}

Workspace.Item = WorkspaceItem;
