import type { CourseSeed } from "../../types";
import { crypto } from "./crypto";
import { accessControl } from "./accessControl";
import { activeDirectory } from "./activeDirectory";
import { network } from "./network";
import { systemReverse } from "./systemReverse";
import { soc } from "./soc";
import { distributed } from "./distributed";
import { database } from "./database";
import { epayment } from "./epayment";
import { osint } from "./osint";
import { forensics } from "./forensics";
import { cloud } from "./cloud";
import { socialEngineering } from "./socialEngineering";
import { websec } from "./websec";
import { algoFondations } from "./algo/algoFondations";
import { algoControle } from "./algo/algoControle";
import { asdMemoire } from "./algo/asdMemoire";
import { asdComplexitePiles } from "./algo/asdComplexitePiles";
import { asdArbres } from "./algo/asdArbres";
import { tpCAtelier } from "./algo/tpCAtelier";
import { codesComplexes } from "./algo/codesComplexes";
import { numeration } from "./reseaux/numeration";
import { tp0PacketTracer } from "./reseaux/tp0PacketTracer";
import { introOsi } from "./reseaux/introOsi";
import { ipv4Flsm } from "./reseaux/ipv4Flsm";
import { vlsm } from "./reseaux/vlsm";
import { routageStatique } from "./reseaux/routageStatique";
import { routageDynamique } from "./reseaux/routageDynamique";
import { rip } from "./reseaux/rip";

/** Courses of the "Algorithmique" checkpoint (L1 fundamentals → L2 ASD). */
export const algoCourses: CourseSeed[] = [
  ...algoFondations,
  ...algoControle,
  ...asdMemoire,
  ...asdComplexitePiles,
  ...asdArbres,
  ...tpCAtelier,
  ...codesComplexes,
];

/** Courses of the "Réseaux" checkpoint (prérequis → L3/M1). */
export const reseauxCourses: CourseSeed[] = [
  ...numeration,
  ...tp0PacketTracer,
  ...introOsi,
  ...ipv4Flsm,
  ...vlsm,
  ...routageStatique,
  ...routageDynamique,
  ...rip,
];

/** Every course, in display order. */
export const allCourses: CourseSeed[] = [
  ...algoCourses,
  ...reseauxCourses,
  crypto,
  accessControl,
  activeDirectory,
  network,
  systemReverse,
  soc,
  distributed,
  database,
  epayment,
  osint,
  forensics,
  cloud,
  socialEngineering,
  websec,
];
