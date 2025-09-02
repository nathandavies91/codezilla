import { ComponentProps } from "react";

import { WorkspaceItemHeaderAlignment } from "./workspace-item-header.enums";

export type WorkspaceItemHeaderProps = ComponentProps<"header"> & {
  alignment?: WorkspaceItemHeaderAlignment;
  flex?: boolean;
}
