export const pathToRoute = (filePath: string): string => {
  // Handle Next.js app directory routing
  if (filePath.startsWith("src/app/")) {
    let route = filePath.replace("src/app", "");
    
    // Remove page.tsx, layout.tsx, etc.
    route = route.replace(/\/(page|layout|loading|error|not-found|global-error|template|default)\.(tsx?|jsx?)$/, "");
    
    // If empty route, default to "/"
    if (!route || route === "") {
      route = "/";
    }
    
    // Ensure route starts with "/"
    if (!route.startsWith("/")) {
      route = "/" + route;
    }
    
    return route;
  }

  // Handle pages directory routing (if applicable)
  if (filePath.startsWith("src/pages/")) {
    let route = filePath.replace("src/pages", "");
    
    // Remove file extensions
    route = route.replace(/\.(tsx?|jsx?)$/, "");
    
    // Handle index files
    if (route.endsWith("/index")) {
      route = route.replace("/index", "");
    }
    
    // If empty route, default to "/"
    if (!route || route === "") {
      route = "/";
    }
    
    // Ensure route starts with "/"
    if (!route.startsWith("/")) {
      route = "/" + route;
    }
    
    return route;
  }
  
  return "/";
}