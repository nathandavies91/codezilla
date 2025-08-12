"use client";
import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from "react";

export interface PreviewHandle {
  updateRoute: (route: string) => void;
}

interface PreviewProps {
  code: string;
}

const Preview = forwardRef<PreviewHandle, PreviewProps>(({ code }, ref) => {
  const [currentRoute, setCurrentRoute] = useState("/");
  const [inputValue, setInputValue] = useState("/");
  
  useImperativeHandle(ref, () => ({
    updateRoute: (route: string) => {
      setCurrentRoute(route);
      setInputValue(route);
    }
  }));

  // URL of the app running inside Docker (configurable at build time)
  const containerUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CONTAINER_URL || "http://localhost:3001";
    // Ensure route starts with / and append to base URL
    const route = currentRoute.startsWith("/") ? currentRoute : `/${currentRoute}`;
    return `${baseUrl}${route}`;
  }, [currentRoute]);

  const handleInputBlur = () => {
    setCurrentRoute(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCurrentRoute(inputValue);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-white/80 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Route:</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder="/"
            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
          />
          <button
            onClick={() => {
              setCurrentRoute("/");
              setInputValue("/");
            }}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition"
            title="Reset to home"
          >
            Home
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Preview URL: {containerUrl}
        </div>
      </div>
      <iframe
        key={containerUrl} // Force reload when URL changes
        src={containerUrl}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        className="flex-1 border-0 bg-white"
      />
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
