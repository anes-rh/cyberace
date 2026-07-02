"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullScreenLoader } from "@/components/ui/Spinner";

/** Gates its children behind authentication, redirecting to /login otherwise. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <FullScreenLoader label="Vérification de la session…" />;
  return <>{children}</>;
}
