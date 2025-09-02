import { ReactNode } from "react";

import { OneOrMore } from "@/types/one-or-more.type";

export type ContainerProps = {
  children: OneOrMore<ReactNode>;
}
