import { FaCode, FaEye, FaReact } from "react-icons/fa";
import { IoChatbubblesSharp, IoChevronDown, IoChevronForward } from "react-icons/io5";
import { MdCss, MdFullscreen } from "react-icons/md";
import { RiFile2Fill, RiFileAddFill, RiFolderAddFill, RiJavascriptLine, RiSaveFill } from "react-icons/ri";
import { TbBrandTypescript, TbLetterLSmall, TbLetterMSmall, TbLetterSSmall } from "react-icons/tb";

export const IconVariant = {
  AddFile: RiFileAddFill,
  AddFolder: RiFolderAddFill,
  Chat: IoChatbubblesSharp,
  Chevrons: {
    Down: IoChevronDown,
    Right: IoChevronForward,
  },
  Code: FaCode,
  Eye: FaEye,
  Files: {
    Css: MdCss,
    Javascript: RiJavascriptLine,
    React: FaReact,
    Typescript: TbBrandTypescript,
  },
  FullScreen: MdFullscreen,
  File: RiFile2Fill,
  Save: RiSaveFill,
  Sizes: {
    Large: TbLetterLSmall,
    Medium: TbLetterMSmall,
    Small: TbLetterSSmall,
  },
}
