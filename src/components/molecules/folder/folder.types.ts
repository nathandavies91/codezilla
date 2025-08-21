export type FolderProps = {
  isOpen?: boolean;
  name: string;
  onClick?: () => void;
  onCreateFileRequest?: () => void;
  onCreateFolderRequest?: () => void;
}
