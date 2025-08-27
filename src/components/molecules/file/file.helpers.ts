import { IconVariant } from "@/components/atoms/icon";

export const getIconByFilename = (name: string) => {
  const extension = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";

  switch (extension) {
    case "css":
      return IconVariant.Files.Css;

    case "js":
      return IconVariant.Files.Javascript;

    case "jsx":
    case "tsx":
      return IconVariant.Files.React;

    case "ts":
      return IconVariant.Files.Typescript;
    
    default:
      return IconVariant.File;
  }
}
