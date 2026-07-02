import { connectDatabase, disconnectDatabase } from "../config/db";
import { Course } from "../models/Course";
import { Challenge } from "../models/Challenge";
import { allCourses } from "./courses";

export interface SeedSummary {
  courses: number;
  challenges: number;
}

/**
 * Idempotently upserts every course and challenge from the content files.
 * @param reset  when true, wipes the collections first (used by `npm run seed`).
 */
export async function runSeed({ reset }: { reset: boolean }): Promise<SeedSummary> {
  if (reset) {
    await Promise.all([Course.deleteMany({}), Challenge.deleteMany({})]);
  }

  let courses = 0;
  let challenges = 0;

  for (const course of allCourses) {
    const { challenges: courseChallenges, ...courseFields } = course;
    await Course.updateOne(
      { slug: course.slug },
      { $set: courseFields },
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

  return { courses, challenges };
}

// Standalone execution: `npm run seed`
if (require.main === module) {
  (async () => {
    const message = await connectDatabase();
    console.log(`[seed] ${message}`);
    const summary = await runSeed({ reset: true });
    console.log(
      `[seed] Terminé — ${summary.courses} courses et ${summary.challenges} challenges insérés.`
    );
    await disconnectDatabase();
    process.exit(0);
  })().catch((err) => {
    console.error("[seed] Échec:", err);
    process.exit(1);
  });
}
