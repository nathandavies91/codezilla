import { FaReact } from "react-icons/fa";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import { MdCss } from "react-icons/md";
import { RiFile2Fill, RiFileAddFill, RiFolderAddFill, RiJavascriptLine, RiSaveFill } from "react-icons/ri";
import { TbBrandTypescript } from "react-icons/tb";

export const IconVariant = {
  AddFile: RiFileAddFill,
  AddFolder: RiFolderAddFill,
  Chevrons: {
    Down: IoChevronDown,
    Right: IoChevronForward,
  },
  Files: {
    Css: MdCss,
    Javascript: RiJavascriptLine,
    React: FaReact,
    Typescript: TbBrandTypescript,
  },
  File: RiFile2Fill,
  Save: RiSaveFill,
}
