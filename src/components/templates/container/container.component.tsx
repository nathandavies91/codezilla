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
            height: 100%;
          }
        `}
      </style>
    </>
  )
}

