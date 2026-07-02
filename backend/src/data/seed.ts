import { connectDatabase, disconnectDatabase } from "../config/db";
import { Course } from "../models/Course";
import { Challenge } from "../models/Challenge";
import { Checkpoint } from "../models/Checkpoint";
import { allCourses } from "./courses";
import { allCheckpoints, CYBER_CHECKPOINT } from "./checkpoints";

export interface SeedSummary {
  checkpoints: number;
  courses: number;
  challenges: number;
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
    ]);
  }

  let checkpoints = 0;
  let courses = 0;
  let challenges = 0;

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

  return { checkpoints, courses, challenges };
}

// Standalone execution: `npm run seed`
if (require.main === module) {
  (async () => {
    const message = await connectDatabase();
    console.log(`[seed] ${message}`);
    const summary = await runSeed({ reset: true });
    console.log(
      `[seed] Terminé — ${summary.checkpoints} checkpoints, ${summary.courses} courses et ${summary.challenges} challenges insérés.`
    );
    await disconnectDatabase();
    process.exit(0);
  })().catch((err) => {
    console.error("[seed] Échec:", err);
    process.exit(1);
  });
}
