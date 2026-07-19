"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "./ThemeProvider";
import SmoothScroll from "./SmoothScroll";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </AuthProvider>
    </ThemeProvider>
  );
}
