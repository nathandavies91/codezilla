import { IconVariant } from "@/components/atoms/icon";

export const getIconByFilename = (name: string) => {
  const extension = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";

  switch (extension) {
    case "css":
      return IconVariant.Css;

    case "js":
    case "jsx":
      return IconVariant.Javascript;

    case "ts":
    case "tsx":
      return IconVariant.Typescript;
    
    default:
      return IconVariant.File;
  }
}
