"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import SmoothScroll from "./SmoothScroll";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </AuthProvider>
  );
}
