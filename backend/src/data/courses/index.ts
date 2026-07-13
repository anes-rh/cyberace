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
import { introduction as cyrIntroduction } from "./cyber/reseaux/introduction";
import { attaques as cyrAttaques } from "./cyber/reseaux/attaques";
import { coucheLiaison as cyrCoucheLiaison } from "./cyber/reseaux/coucheLiaison";
import { infrastructures as cyrInfrastructures } from "./cyber/reseaux/infrastructures";
import { interconnexion as cyrInterconnexion } from "./cyber/reseaux/interconnexion";
import { ipv6Ipsec as cyrIpv6Ipsec } from "./cyber/reseaux/ipv6Ipsec";
import { applications as cyrApplications } from "./cyber/reseaux/applications";
import { routageDns as cyrRoutageDns } from "./cyber/reseaux/routageDns";
import { vulnerabilites as cyrVulnerabilites } from "./cyber/reseaux/vulnerabilites";
import { aptCase as cyrAptCase } from "./cyber/reseaux/aptCase";
import { rootkits as cysRootkits } from "./cyber/systeme/rootkits";
import { memoire as cysMemoire } from "./cyber/systeme/memoire";
import { controleAcces as cysControleAcces } from "./cyber/systeme/controleAcces";
import { bellLapadula as cysBellLapadula } from "./cyber/systeme/bellLapadula";
import { canauxCaches as cysCanauxCaches } from "./cyber/systeme/canauxCaches";
import { virtualisation as cysVirtualisation } from "./cyber/systeme/virtualisation";
import { attaquesVirtualisation as cysAttaquesVirtualisation } from "./cyber/systeme/attaquesVirtualisation";
import { module1Recon } from "./cyber-pratique/module1Recon";
import { module2ArpSpoofing } from "./cyber-pratique/module2ArpSpoofing";
import { module3PrivescLinux } from "./cyber-pratique/module3PrivescLinux";
import { module4MacFloodingDetect } from "./cyber-pratique/module4MacFloodingDetect";
import { module5CronPrivesc } from "./cyber-pratique/module5CronPrivesc";
import { module6SnmpSniffing } from "./cyber-pratique/module6SnmpSniffing";
import { module7GitExposure } from "./cyber-pratique/module7GitExposure";
import { module8CapabilitiesPrivesc } from "./cyber-pratique/module8CapabilitiesPrivesc";
import { module9IcmpExfilDetect } from "./cyber-pratique/module9IcmpExfilDetect";
import { module10CapstoneChain } from "./cyber-pratique/module10CapstoneChain";
import { module11VhostEnum } from "./cyber-pratique/module11VhostEnum";
import { module12DnsZoneTransfer } from "./cyber-pratique/module12DnsZoneTransfer";
import { module13PortscanDetect } from "./cyber-pratique/module13PortscanDetect";
import { module14PasswordCracking } from "./cyber-pratique/module14PasswordCracking";
import { module15PasswdWritable } from "./cyber-pratique/module15PasswdWritable";
import { module16TlsCertLeak } from "./cyber-pratique/module16TlsCertLeak";

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

/** Courses of the "Sécurité réseaux" mini-checkpoint (théorie). */
export const cyberReseauxCourses: CourseSeed[] = [
  ...cyrIntroduction,
  ...cyrAttaques,
  ...cyrCoucheLiaison,
  ...cyrInfrastructures,
  ...cyrInterconnexion,
  ...cyrIpv6Ipsec,
  ...cyrApplications,
  ...cyrRoutageDns,
  ...cyrVulnerabilites,
  ...cyrAptCase,
];

/** Courses of the "Sécurité système" mini-checkpoint (théorie). */
export const cyberSystemeCourses: CourseSeed[] = [
  ...cysRootkits,
  ...cysMemoire,
  ...cysControleAcces,
  ...cysBellLapadula,
  ...cysCanauxCaches,
  ...cysVirtualisation,
  ...cysAttaquesVirtualisation,
];

/** Courses of the "Cybersécurité — Pratique" checkpoint (labs Docker réels). */
export const cyberPratiqueCourses: CourseSeed[] = [
  ...module1Recon,
  ...module2ArpSpoofing,
  ...module3PrivescLinux,
  ...module4MacFloodingDetect,
  ...module5CronPrivesc,
  ...module6SnmpSniffing,
  ...module7GitExposure,
  ...module8CapabilitiesPrivesc,
  ...module9IcmpExfilDetect,
  ...module10CapstoneChain,
  ...module11VhostEnum,
  ...module12DnsZoneTransfer,
  ...module13PortscanDetect,
  ...module14PasswordCracking,
  ...module15PasswdWritable,
  ...module16TlsCertLeak,
];

/** Every course, in display order. */
export const allCourses: CourseSeed[] = [
  ...algoCourses,
  ...reseauxCourses,
  ...systemeCourses,
  ...bddCourses,
  ...cyberIntroCourses,
  ...cyberWifiCourses,
  ...cyberReseauxCourses,
  ...cyberSystemeCourses,
  ...cyberPratiqueCourses,
];
