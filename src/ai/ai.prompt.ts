import { PullRequestDto } from '../release_notes/dto/pull_request.dto';

export function buildAiPrompt( pullRequests: PullRequestDto[],): string {
  return `
Generate release notes enhancements from the following pull requests.

Rules:
- Do NOT invent new features or PRs
- Use ONLY provided titles and labels
- Keep bullets under 120 characters
- Return JSON ONLY with this shape:
{
  "highlights": string[],
  "risksAndNotes": string[]
}

Pull Requests:
${pullRequests.map(pr =>
  `- Title: ${pr.title}, Labels: ${pr.labels.join(', ')}`
).join('\n')}
`;
}
