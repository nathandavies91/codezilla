"use client";
import { useMemo } from "react";

export default function Preview({ code }: { code: string }) {
  // URL of the app running inside Docker (configurable at build time)
  const containerUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_CONTAINER_URL || "http://localhost:3001";
  }, []);

  return (
    <iframe
      src={containerUrl}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      className="w-full h-full border rounded-md"
    />
  );
}
