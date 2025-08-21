export type FileExplorerHandle = {
  refreshParents: (parents: string[]) => Promise<void>;
};

export type FileExplorerProps = {
  onOpenFileRequest: (args: {
    content: string;
    path: string;
  }) => void;
  root?: string;
};

export type FileNode = {
  name: string;
  path: string;
  type: "file" | "directory";
};
