import { ReactElement } from "react";

import { OneOrMore } from "@/types/one-or-more.type";

import { WorkspaceItemBodyProps } from "./body";
import { WorkspaceItemFooterProps } from "./footer";
import { WorkspaceItemHeaderProps } from "./header";

export type WorkspaceItemProps = {
  children: OneOrMore<ReactElement<WorkspaceItemBodyProps> | ReactElement<WorkspaceItemFooterProps> | ReactElement<WorkspaceItemHeaderProps>>;
  maxWidth?: number;
  minWidth?: number;
}
