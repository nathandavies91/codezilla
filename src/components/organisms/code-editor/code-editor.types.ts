export type CodeEditorProps = {
  code?: string;
  filePath?: string;
  onSaveRequest?: (filePath: string, content: string) => Promise<void>;
}
