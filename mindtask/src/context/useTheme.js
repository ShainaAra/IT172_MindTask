import { useContext } from "react";
import { ThemeCtx } from "./ThemeCtx";

export const useTheme = () => useContext(ThemeCtx);
