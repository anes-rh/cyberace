import {
  KeyRound, Grid3x3, Network, Wifi, Binary, Siren, Orbit, Database, CreditCard,
  Ghost, Fingerprint, Cloud, Brain, Bug, Trophy, Flag, Shield, ShieldCheck, Cpu, Route,
  Terminal, HardDrive, FolderTree, Cog, Boxes, Layers, Server, MemoryStick, Monitor, GitFork,
  Radar, Globe, Waves, ArrowUpCircle, ServerCog, Swords,
  ScrollText, ShieldAlert, Lock, AlertTriangle, FileCheck, Ban, History, FileKey,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const MAP: Record<string, ComponentType<LucideProps>> = {
  KeyRound, Grid3x3, Network, Wifi, Binary, Siren, Orbit, Database, CreditCard,
  Ghost, Fingerprint, Cloud, Brain, Bug, Trophy, Flag, Shield, ShieldCheck, Cpu, Route,
  Terminal, HardDrive, FolderTree, Cog, Boxes, Layers, Server, MemoryStick, Monitor, GitFork,
  Radar, Globe, Waves, ArrowUpCircle, ServerCog, Swords,
  ScrollText, ShieldAlert, Lock, AlertTriangle, FileCheck, Ban, History, FileKey,
};

/** Renders a lucide icon by its string name (used for course/badge icons). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = MAP[name] ?? Shield;
  return <Cmp {...props} />;
}
