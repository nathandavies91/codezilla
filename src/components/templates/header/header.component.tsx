"use client";

import { Heading } from "@/components/atoms/heading";
import Link from "next/link";

export const Header = () => {
  return (
    <>
      <header>
        <Link href="/">
          <Heading level={1}>
            Codezilla
          </Heading>
        </Link>
      </header>
      <style jsx>
        {`
          header {
            padding: 1em;
          }
        `}
      </style>
    </>
  )
}
