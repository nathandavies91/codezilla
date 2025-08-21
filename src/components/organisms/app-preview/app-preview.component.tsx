"use client";

import { useMemo, useState, forwardRef, useImperativeHandle, FormEvent } from "react";

import { Iframe } from "@/components/atoms/iframe";
import { Input } from "@/components/atoms/input";
import { Form } from "@/components/molecules/form";

import { AppPreviewHandle, AppPreviewProps } from "./app-preview.types";

export const AppPreview = forwardRef<AppPreviewHandle, AppPreviewProps>(({
  appBaseUrl,
}, ref) => {
  const [currentRoute, setCurrentRoute] = useState("/");
  
  useImperativeHandle(ref, () => ({
    updateRoute: (route: string) => {
      setCurrentRoute(route);
    }
  }));

  const containerUrl = useMemo(() => {
    const route = currentRoute.startsWith("/") ? currentRoute : `/${currentRoute}`;
    return `${appBaseUrl}${route}`;
  }, [currentRoute]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const route = new FormData(e.currentTarget)?.get("route") as string;
    setCurrentRoute(route);
  }

  return (
    <>
      <header>
        <Form onSubmit={handleSubmit}>
          <Input
            defaultValue={currentRoute}
            name="route"
            placeholder="/"
            type="text"
          />
        </Form>
      </header>
      <Iframe
        key={containerUrl} // Force reload when URL changes
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        src={containerUrl}
      />
      <style jsx>
        {`
          header {
            padding: 1em;
          }
        `}
      </style>
    </>
  );
});
