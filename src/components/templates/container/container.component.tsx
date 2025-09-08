import { ContainerProps } from "./container.types";

export const Container = ({
  children,
}: ContainerProps) => {
  return (
    <>
      <div>
        {children}
      </div>
      <style jsx>
        {`
          div {
            background: var(--accent);
            border-radius: .62em;
            box-shadow: 0 0 2px var(--border-color);
            height: 100%;
            overflow: hidden;
          }
        `}
      </style>
    </>
  )
}

