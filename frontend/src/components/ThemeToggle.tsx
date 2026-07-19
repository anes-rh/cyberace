"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "./ThemeProvider";

/**
 * Bascule clair/sombre. L'icône affichée représente TOUJOURS l'action à venir
 * (Sun en mode sombre = « repasser en clair », Moon en clair = « passer en
 * sombre »). On rend UNE seule icône conditionnellement (pas de crossfade par
 * opacité : le composant se re-rend par rafales, ce qui bloquait une transition
 * d'opacité empilée). Style aligné sur les autres boutons de la navbar
 * (ghost/icon en desktop, glass/sm dans le menu mobile).
 */
export function ThemeToggle({
  variant = "ghost",
  size = "icon",
  showLabel = false,
  className,
}: {
  variant?: "ghost" | "glass";
  size?: "icon" | "sm";
  showLabel?: boolean;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      title="Basculer le thème clair/sombre"
      aria-label="Basculer le thème clair/sombre"
      className={className}
    >
      <Icon className="h-4 w-4 transition-transform duration-300 ease-out" />
      {showLabel && <span>{isDark ? "Thème clair" : "Thème sombre"}</span>}
    </Button>
  );
}
