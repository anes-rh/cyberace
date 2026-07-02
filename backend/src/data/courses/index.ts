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

/** Every course, in display order. */
export const allCourses: CourseSeed[] = [
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
