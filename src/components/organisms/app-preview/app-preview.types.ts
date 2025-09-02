import { AppPreviewSize } from "./app-preview.enums";

export type AppPreviewHandle = {
  updateRoute: (route: string) => void;
  updateSize: (size: AppPreviewSize) => void;
}

export type AppPreviewProps = {
  appBaseUrl: string;
}
