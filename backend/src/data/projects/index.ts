import type { ProjectSeed } from "../../types";
import { operationSentinelle } from "./operationSentinelle";
import { shadowdomain } from "./shadowdomain";
import { pipelineFantome } from "./pipelineFantome";
import { overflow } from "./overflow";

/** Tous les projets (checkpoint « Cybersécurité — Projets »). */
export const allProjects: ProjectSeed[] = [operationSentinelle, shadowdomain, pipelineFantome, overflow];
