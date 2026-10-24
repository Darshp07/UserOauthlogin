import { useContext } from "react";
import AuthContext from "./authContextValue.js";

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAppAuth must be used within an AuthProvider.");
  }
  return context;
}
