import { FormProps } from "./form.types";

export const Form = ({
  flex,
  ...props
}: FormProps) => {
  return (
    <>
      <form {...props} />
      <style jsx>
        {`
          form {
            border: 2px solid currentColor;
            border-radius: 2em;
            display: ${flex ? "flex" : "block"};
            flex-grow: 1;
            gap: 1em;
            padding: .31em .62em;
          }
        `}
      </style>
    </>
  )
}
