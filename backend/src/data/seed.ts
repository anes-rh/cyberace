import { connectDatabase, disconnectDatabase } from "../config/db";
import { Course } from "../models/Course";
import { Challenge } from "../models/Challenge";
import { Checkpoint } from "../models/Checkpoint";
import { Project } from "../models/Project";
import { ProjectObjective } from "../models/ProjectObjective";
import { allCourses } from "./courses";
import { allCheckpoints, CYBER_CHECKPOINT } from "./checkpoints";
import { allProjects } from "./projects";

export interface SeedSummary {
  checkpoints: number;
  courses: number;
  challenges: number;
  projects: number;
  objectives: number;
}

/**
 * Idempotently upserts every checkpoint, course and challenge from the content files.
 * @param reset  when true, wipes the collections first (used by `npm run seed`).
 */
export async function runSeed({ reset }: { reset: boolean }): Promise<SeedSummary> {
  if (reset) {
    await Promise.all([
      Checkpoint.deleteMany({}),
      Course.deleteMany({}),
      Challenge.deleteMany({}),
      Project.deleteMany({}),
      ProjectObjective.deleteMany({}),
    ]);
  }

  let checkpoints = 0;
  let courses = 0;
  let challenges = 0;
  let projects = 0;
  let objectives = 0;

  for (const cp of allCheckpoints) {
    await Checkpoint.updateOne({ slug: cp.slug }, { $set: cp }, { upsert: true });
    checkpoints += 1;
  }

  for (const course of allCourses) {
    const { challenges: courseChallenges, ...courseFields } = course;
    await Course.updateOne(
      { slug: course.slug },
      { $set: { ...courseFields, checkpoint: course.checkpoint ?? CYBER_CHECKPOINT } },
      { upsert: true }
    );
    courses += 1;

    for (const ch of courseChallenges) {
      const { id, ...rest } = ch;
      await Challenge.updateOne(
        { challengeId: id },
        { $set: { challengeId: id, courseSlug: course.slug, ...rest } },
        { upsert: true }
      );
      challenges += 1;
    }
  }

  for (const project of allProjects) {
    const { objectives: projObjectives, ...projectFields } = project;
    await Project.updateOne({ slug: project.slug }, { $set: projectFields }, { upsert: true });
    projects += 1;
    for (const obj of projObjectives) {
      await ProjectObjective.updateOne(
        { projectSlug: project.slug, id: obj.id },
        { $set: obj },
        { upsert: true }
      );
      objectives += 1;
    }
  }

  return { checkpoints, courses, challenges, projects, objectives };
}

// Standalone execution: `npm run seed`
if (require.main === module) {
  (async () => {
    const message = await connectDatabase();
    console.log(`[seed] ${message}`);
    const summary = await runSeed({ reset: true });
    console.log(
      `[seed] Terminé — ${summary.checkpoints} checkpoints, ${summary.courses} courses, ${summary.challenges} challenges, ${summary.projects} projets (${summary.objectives} objectifs) insérés.`
    );
    await disconnectDatabase();
    process.exit(0);
  })().catch((err) => {
    console.error("[seed] Échec:", err);
    process.exit(1);
  });
}
