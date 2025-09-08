"use client";
 
import { useServerInsertedHTML } from "next/navigation";
import React, { useState } from "react";
import { StyleRegistry as JsxStyleRegistry, createStyleRegistry } from "styled-jsx";
 
export default function StyleRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  const [styleRegistry] = useState(() => createStyleRegistry());
 
  useServerInsertedHTML(() => {
    const styles = styleRegistry.styles();
    styleRegistry.flush();
    return styles;
  });
 
  return (
    <JsxStyleRegistry registry={styleRegistry}>
      {children}
    </JsxStyleRegistry>
  );
}
