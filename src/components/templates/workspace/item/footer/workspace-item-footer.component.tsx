import { WorkspaceItemFooterProps } from "./workspace-item-footer.types";

export const WorkspaceItemFooter = (props: WorkspaceItemFooterProps) => {
  return (
    <>
      <footer {...props} />
      <style jsx>
        {`
          footer {
            padding: 1em;
          }
        `}
      </style>
    </>
  )
}
