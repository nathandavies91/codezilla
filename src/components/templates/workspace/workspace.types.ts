import { ReactElement, ReactNode } from "react";

export type WorkspaceItemProps = {
  children: ReactNode;
  maxWidth?: number;
  minWidth?: number;
}

export type WorkspaceProps = {
  children: ReactElement<WorkspaceItemProps>[];
}
