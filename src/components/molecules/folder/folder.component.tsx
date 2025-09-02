import { Button } from "@/components/atoms/button";
import { Icon, IconVariant } from "@/components/atoms/icon";

import { FolderProps } from "./folder.types";

export const Folder = ({
  isOpen,
  name,
  onClick,
  onCreateFileRequest,
  onCreateFolderRequest,
}: FolderProps) => {
  return (
    <>
      <div className="container">
        <div className="folder" onClick={onClick}>
          <Icon variant={isOpen ? IconVariant.Chevrons.Down : IconVariant.Chevrons.Right} />
          <span className="name">{name}</span>
        </div>
        {(!!onCreateFileRequest || !!onCreateFolderRequest) && (
          <div className="actions">
            {!!onCreateFolderRequest && (
              <div>
                <Button
                  aria-label="Add folder"
                  onClick={onCreateFolderRequest}
                  variant="flat"
                >
                  <Icon variant={IconVariant.AddFolder} />
                </Button>
              </div>
            )}
            {!!onCreateFileRequest && (
              <div>
                <Button
                  aria-label="Add file"
                  onClick={onCreateFileRequest}
                  variant="flat"
                >
                  <Icon variant={IconVariant.AddFile} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx>
        {`
          .actions,
          .folder {
            align-items: center;
            cursor: ${onClick ? "pointer" : "normal"};
            display: inline-flex;
            gap: .62em;
          }
          
          .container {
            display: inline-flex;
            gap: 1.62em;
            width: 100%;
          }

          .folder {
            flex-grow: 1;
            overflow: hidden;
          }

          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}
      </style>
    </>
  )
}