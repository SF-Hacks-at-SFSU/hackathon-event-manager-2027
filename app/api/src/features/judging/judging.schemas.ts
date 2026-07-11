import z from 'zod';

export const submitProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  repoUrl: z.url().optional(),
  demoUrl: z.url().optional(),
  videoUrl: z.url().optional()
});
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;

export const createRubricSchema = z.object({
  name: z.string().min(1),
  criteria: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        maxScore: z.number().int().positive().default(10),
        weight: z.number().positive().default(1)
      })
    )
    .min(1)
});
export type CreateRubricInput = z.infer<typeof createRubricSchema>;

export const assignJudgeSchema = z.object({
  judgeProfileId: z.uuid(),
  submissionId: z.uuid()
});
export type AssignJudgeInput = z.infer<typeof assignJudgeSchema>;

export const autoAssignSchema = z.object({
  submissionsPerJudge: z.number().int().positive().default(6)
});
export type AutoAssignInput = z.infer<typeof autoAssignSchema>;

export const submitScoreSchema = z.object({
  submissionId: z.uuid(),
  scores: z
    .array(
      z.object({
        criterionId: z.uuid(),
        value: z.number().nonnegative(),
        comment: z.string().optional()
      })
    )
    .min(1)
});
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
