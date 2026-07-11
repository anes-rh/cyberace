import type { CourseSeed } from "../../types";
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
import { intro as bddIntro } from "./bdd/intro";
import { tp0Oracle } from "./bdd/tp0Oracle";
import { modelisation } from "./bdd/modelisation";
import { ddl } from "./bdd/ddl";
import { dml } from "./bdd/dml";
import { dql } from "./bdd/dql";
import { sqlAvance } from "./bdd/sqlAvance";
import { oracleAdmin } from "./bdd/oracleAdmin";
import { dictionnaire } from "./bdd/dictionnaire";
import { transactions } from "./bdd/transactions";
import { optimisation } from "./bdd/optimisation";
import { distribuees } from "./bdd/distribuees";
import { fondamentaux as cyiFondamentaux } from "./cyber/intro/fondamentaux";
import { classification as cyiClassification } from "./cyber/intro/classification";
import { methodologies as cyiMethodologies } from "./cyber/intro/methodologies";
import { defense as cyiDefense } from "./cyber/intro/defense";
import { conformite as cyiConformite } from "./cyber/intro/conformite";
import { footprinting as cyiFootprinting } from "./cyber/intro/footprinting";
import { enumeration as cyiEnumeration } from "./cyber/intro/enumeration";
import { scan as cyiScan } from "./cyber/intro/scan";
import { fondamentaux as cywFondamentaux } from "./cyber/wifi/fondamentaux";
import { protocoles as cywProtocoles } from "./cyber/wifi/protocoles";
import { handshake as cywHandshake } from "./cyber/wifi/handshake";
import { attaques as cywAttaques } from "./cyber/wifi/attaques";
import { entreprise as cywEntreprise } from "./cyber/wifi/entreprise";
import { architecture as cywArchitecture } from "./cyber/wifi/architecture";

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

/** Courses of the "Base de données" checkpoint (SQL pratique · Oracle). */
export const bddCourses: CourseSeed[] = [
  ...bddIntro,
  ...tp0Oracle,
  ...modelisation,
  ...ddl,
  ...dml,
  ...dql,
  ...sqlAvance,
  ...oracleAdmin,
  ...dictionnaire,
  ...transactions,
  ...optimisation,
  ...distribuees,
];

/** Courses of the "Introduction à la sécurité" mini-checkpoint (théorie). */
export const cyberIntroCourses: CourseSeed[] = [
  ...cyiFondamentaux,
  ...cyiClassification,
  ...cyiMethodologies,
  ...cyiDefense,
  ...cyiConformite,
  ...cyiFootprinting,
  ...cyiEnumeration,
  ...cyiScan,
];

/** Courses of the "Sécurité réseaux sans fil" mini-checkpoint (théorie). */
export const cyberWifiCourses: CourseSeed[] = [
  ...cywFondamentaux,
  ...cywProtocoles,
  ...cywHandshake,
  ...cywAttaques,
  ...cywEntreprise,
  ...cywArchitecture,
];

/** Every course, in display order. */
export const allCourses: CourseSeed[] = [
  ...algoCourses,
  ...reseauxCourses,
  ...systemeCourses,
  ...bddCourses,
  ...cyberIntroCourses,
  ...cyberWifiCourses,
];
