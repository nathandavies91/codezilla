import { ReactElement } from "react";

import { WorkspaceItemProps } from "./item";

export type WorkspaceProps = {
  children: ReactElement<WorkspaceItemProps>[];
  hasDivider?: boolean;
  stackUntil?: number;
}
