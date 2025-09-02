import { WorkspaceItemBodyProps } from "./workspace-item-body.types";

export const WorkspaceItemBody = (props: WorkspaceItemBodyProps) => {
  return (
    <>
      <div {...props} />
      <style jsx>
        {`
          div {
            flex: 1 1 auto;
            padding: ${props.style?.padding ?? 0};
            overflow: auto;
          }
        `}
      </style>
    </>
  )
}
