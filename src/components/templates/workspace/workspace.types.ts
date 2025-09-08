import { ReactElement } from "react";

import { WorkspaceItemProps } from "./item";

export type WorkspaceProps = {
  children: ReactElement<WorkspaceItemProps>[];
  stackUntil?: number;
}
