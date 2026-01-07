import { z } from 'zod';

export const AiReleaseNotesSchema = z.object({
  highlights: z.array(z.string()),
  risksAndNotes: z.array(z.string()),
});

export type AiReleaseNotes = z.infer<typeof AiReleaseNotesSchema>;
