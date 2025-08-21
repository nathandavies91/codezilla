import { HeadingProps } from "./heading.types";

export const Heading = ({
  children,
  level = 2,
}: HeadingProps) => {
  switch (level) {
    case 1: {
      return (
        <>
          <h1>{children}</h1>
          <style>
            {`
              h1 {
                font-size: 2em;
                font-weight: 600;
              }
            `}
          </style>
        </>
      )
    }

    case 2: {
      return (
        <>
          <h2>{children}</h2>
          <style>
            {`
              h2 {
                font-size: 1.75em;
                font-weight: 600;
              }
            `}
          </style>
        </>
      )
    }

    case 3: {
      return (
        <>
          <h3>{children}</h3>
          <style>
            {`
              h3 {
                font-size: 1.5em;
                font-weight: 600;
              }
            `}
          </style>
        </>
      )
    }

    case 4: {
      return (
        <>
          <h4>{children}</h4>
          <style>
            {`
              h4 {
                font-size: 1.25em;
                font-weight: normal;
              }
            `}
          </style>
        </>
      )
    }

    case 5: {
      return (
        <>
          <h5>{children}</h5>
          <style>
            {`
              h5 {
                font-size: 1em;
                font-weight: normal;
              }
            `}
          </style>
        </>
      )
    }

    case 6: {
      return (
        <>
          <h6>{children}</h6>
          <style>
            {`
              h6 {
                font-size: 1em;
                font-weight: normal;
              }
            `}
          </style>
        </>
      )
    }
  }
}
