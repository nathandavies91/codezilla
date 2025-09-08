"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Icon, IconVariant } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { Form } from "@/components/molecules/form";
import { AppPreview, AppPreviewHandle, AppPreviewSize } from "@/components/organisms/app-preview";
import { Chat } from "@/components/organisms/chat";
import { CodeEditor } from "@/components/organisms/code-editor";
import { FileExplorer, FileExplorerHandle } from "@/components/organisms/file-explorer";
import { Container } from "@/components/templates/container";
import { Workspace } from "@/components/templates/workspace";
import { WorkspaceItemHeaderAlignment } from "@/components/templates/workspace/item/header";
import { pathToRoute } from "@/helpers";

export default function Page() {
  const appBaseUrl = process.env.NEXT_PUBLIC_CONTAINER_URL || "http://localhost:3001";
  const appPreviewRef = useRef<AppPreviewHandle>(null);
  const [appPreviewSize, setAppPreviewSize] = useState(AppPreviewSize.Full);
  const [code, setCode] = useState<string>();
  const explorerRef = useRef<FileExplorerHandle>(null);
  const [filePath, setFilePath] = useState<string>();
  const [isAppPreviewVisible, setIsAppPreviewVisible] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isFileSaving, setIsFileSaving] = useState(false);
  const [route, setRoute] = useState("/");
  const [routeFormValue, setRouteFormValue] = useState(route);

  useEffect(() => {
    appPreviewRef.current?.updateSize(appPreviewSize);
  }, [appPreviewSize]);

  useEffect(() => {
    appPreviewRef.current?.updateRoute(route);
    setRouteFormValue(route);
  }, [route]);

  const handleAppPreviewResize = (size: AppPreviewSize) => {
    setAppPreviewSize(oldSize => size === oldSize ? AppPreviewSize.Full : size);
  }

  const handleAppPreviewSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const route = new FormData(e.currentTarget)?.get("route") as string;
    setRoute(route);
  }

  const handleCodeChange = (filePath: string, code: string) => {
    setFilePath(filePath);
    setCode(code);
  }

  const handleOpenFileRequest = ({
    content,
    path,
  }: {
    content: string;
    path: string;
  }) => {
    setCode(content);
    setFilePath(path);
    
    // Auto-update preview route if it's a page file
    if (path.includes("/layout.") || path.includes("/page.") || path.startsWith("src/pages/")) {
      const route = pathToRoute(path);
      setRoute(route);
    }
  }

  const handleFileSaveRequest = async (filePath: string) => {
    try {
      setIsFileSaving(true);

      const res = await fetch("/api/fs/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content: code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert("Save failed: " + (data?.error || res.statusText));
      }
    }
    catch (e) {
      console.error(e);
      window.alert("Save failed");
    }
    finally {
      setIsFileSaving(false);
    }
  }

  const handleToggleAppPreview = () => {
    setIsAppPreviewVisible((oldValue) => !oldValue);

    if (isAppPreviewVisible) {
      setIsCodeVisible(true);
    }
  }

  const handleToggleCodeEditor = () => {
    setIsCodeVisible((oldValue) => !oldValue);

    if (isCodeVisible) {
      setIsAppPreviewVisible(true);
    }
  }

  return (
    <Workspace>
      {isChatVisible ? (
        <Workspace.Item maxWidth={400} minWidth={300}>
          <Workspace.Item.Header>
            <Button
              aria-label="Hide chat"
              onClick={() => setIsChatVisible(false)}
              variant="solid"
            >
              <Icon variant={IconVariant.Chat} />
            </Button>
          </Workspace.Item.Header>
          <Workspace.Item.Body style={{ padding: "0 1em" }}>
            <Chat />
          </Workspace.Item.Body>
          <Workspace.Item.Footer>
            <Form flex>
              <Input placeholder="Ask..." />
              <Button
                aria-label="Submit"
                type="submit"
                variant="flat"
              >
                <Icon variant={IconVariant.Chevrons.Right} />
              </Button>
            </Form>
          </Workspace.Item.Footer>
        </Workspace.Item>
      ) : <></>}
      <Workspace.Item>
        <Workspace.Item.Header alignment={WorkspaceItemHeaderAlignment.Right} flex>
          {!isChatVisible ? (
            <Button
              aria-label="Show chat"
              onClick={() => setIsChatVisible(true)}
            >
              <Icon variant={IconVariant.Chat} />
            </Button>
          ) : <></>}
          <Button
            aria-label={`${isCodeVisible ? "Hide" : "Show"} code editor`}
            onClick={handleToggleCodeEditor}
            variant={isCodeVisible ? "solid" : "outlined"}
          >
            <Icon variant={IconVariant.Code} />
          </Button>
          <Button
            aria-label={`${isAppPreviewVisible ? "Hide" : "Show"} app preview`}
            onClick={handleToggleAppPreview}
            variant={isAppPreviewVisible ? "solid" : "outlined"}
          >
            <Icon variant={IconVariant.Eye} />
          </Button>
        </Workspace.Item.Header>
        <Workspace.Item.Body style={{ padding: "0 1em 1em" }}>
          <Container>
            <Workspace stackUntil={1200}>
              {isCodeVisible ? (
                <Workspace.Item>
                  <Workspace>
                    <Workspace.Item minWidth={200} maxWidth={400}>
                      <Workspace.Item.Body style={{ padding: "1em" }}>
                        <FileExplorer
                          onOpenFileRequest={handleOpenFileRequest}
                          ref={explorerRef}
                          root="src"
                        />
                      </Workspace.Item.Body>
                    </Workspace.Item>
                    {!!filePath ? (
                      <Workspace.Item minWidth={400}>
                        <Workspace.Item.Header flex>
                          {filePath && (
                            <span style={{ flexGrow: 1 }}>{filePath}</span>
                          )}
                          <div>
                            <Button
                              aria-label="Save document"
                              disabled={isFileSaving}
                              onClick={() => handleFileSaveRequest(filePath!)}
                              variant="flat"
                            >
                              <Icon variant={IconVariant.Save} />
                            </Button>
                          </div>
                        </Workspace.Item.Header>
                        <Workspace.Item.Body>
                          <CodeEditor
                            code={code}
                            filePath={filePath}
                            onChange={(code) => handleCodeChange(filePath!, code)}
                          />
                        </Workspace.Item.Body>
                      </Workspace.Item>
                    ) : <></>}
                  </Workspace>
                </Workspace.Item>
              ) : <></>}
              {isAppPreviewVisible ? (
                <Workspace.Item minWidth={400}>
                  <Workspace.Item.Header flex>
                    <Form flex onSubmit={handleAppPreviewSubmit}>
                      <Input
                        defaultValue={route}
                        onChange={(e) => setRouteFormValue(e.target.value)}
                        name="route"
                        placeholder="/"
                        value={routeFormValue}
                      />
                      <Button
                        type="submit"
                        variant="flat"
                      >
                        <Icon variant={IconVariant.Chevrons.Right} />
                      </Button>
                    </Form>
                    <Button
                      aria-label="Set app preview to mobile size"
                      onClick={() => handleAppPreviewResize(AppPreviewSize.Small)}
                      variant={appPreviewSize === AppPreviewSize.Small ? "solid" : "outlined"}
                    >
                      <Icon variant={IconVariant.Sizes.Small} />
                    </Button>
                    <Button
                      aria-label="Set app preview to tablet size"
                      onClick={() => handleAppPreviewResize(AppPreviewSize.Medium)}
                      variant={appPreviewSize === AppPreviewSize.Medium ? "solid" : "outlined"}
                    >
                      <Icon variant={IconVariant.Sizes.Medium} />
                    </Button>
                    <Button
                      aria-label="Set app preview to desktop size"
                      onClick={() => handleAppPreviewResize(AppPreviewSize.Large)}
                      variant={appPreviewSize === AppPreviewSize.Large ? "solid" : "outlined"}
                    >
                      <Icon variant={IconVariant.Sizes.Large} />
                    </Button>
                  </Workspace.Item.Header>
                  <Workspace.Item.Body>
                    <AppPreview
                      appBaseUrl={appBaseUrl}
                      ref={appPreviewRef}
                    />
                  </Workspace.Item.Body>
                </Workspace.Item>
              ) : <></>}
            </Workspace>
          </Container>
        </Workspace.Item.Body>
      </Workspace.Item>
    </Workspace>
  )
}
