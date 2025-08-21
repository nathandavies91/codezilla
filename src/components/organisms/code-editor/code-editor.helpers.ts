export const getLanguageByFilename = (name?: string) => {
  const extension = name?.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";

  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";

    case "md":
    case "mdx":
      return "markdown";

    case "ts":
    case "tsx":
      return "typescript";
    
    default:
      return extension;
  }
}