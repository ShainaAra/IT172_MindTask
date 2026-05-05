import { useContext } from "react";
import { AuthCtx } from "./AuthCtx";

export const useAuth = () => useContext(AuthCtx);
