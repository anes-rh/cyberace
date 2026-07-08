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
import { ospf } from "./reseaux/ospf";
import { vlan } from "./reseaux/vlan";
import { stpEtherchannel } from "./reseaux/stpEtherchannel";
import { fhrp } from "./reseaux/fhrp";
import { bgp } from "./reseaux/bgp";
import { greVpn } from "./reseaux/greVpn";
import { wan } from "./reseaux/wan";
import { ipv6 } from "./reseaux/ipv6";
import { dhcp } from "./reseaux/dhcp";
import { architectures } from "./reseaux/architectures";
import { intro as seIntro } from "./systeme/intro";
import { tp0Vm } from "./systeme/tp0Vm";
import { terminal } from "./systeme/terminal";
import { bash } from "./systeme/bash";
import { processus } from "./systeme/processus";
import { ordonnancement } from "./systeme/ordonnancement";
import { synchronisation } from "./systeme/synchronisation";
import { ipc } from "./systeme/ipc";
import { memoire } from "./systeme/memoire";
import { fichiers } from "./systeme/fichiers";

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
  ...ospf,
  ...vlan,
  ...stpEtherchannel,
  ...fhrp,
  ...bgp,
  ...greVpn,
  ...wan,
  ...ipv6,
  ...dhcp,
  ...architectures,
];

/** Courses of the "Système d'exploitation" checkpoint (pratique · Linux). */
export const systemeCourses: CourseSeed[] = [
  ...seIntro,
  ...tp0Vm,
  ...terminal,
  ...bash,
  ...processus,
  ...ordonnancement,
  ...synchronisation,
  ...ipc,
  ...memoire,
  ...fichiers,
];

/** Every course, in display order. */
export const allCourses: CourseSeed[] = [
  ...algoCourses,
  ...reseauxCourses,
  ...systemeCourses,
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
