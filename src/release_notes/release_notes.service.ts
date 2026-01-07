import { Injectable , BadRequestException} from '@nestjs/common';
import { ReleaseNotesDto } from './dto/release_notes.dto';
import { AiService } from '../ai/ai.service';
import { buildAiPrompt } from '../ai/ai.prompt';
import { AiReleaseNotesSchema } from '../ai/ai.schema';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ReleaseNotesService {
    //categorize PRs
    //call generate markdown
    //call generate highlights
    //call generate risks&notes
    // add ai part
   constructor(private readonly aiService: AiService, private configService: ConfigService) {
  console.log('[ReleaseNotesService] OPENAI_API_KEY:', this.configService.get<string>('OPENAI_API_KEY'));
}

async generateReleaseNotes(data: ReleaseNotesDto) {
  const sections = {
    features: [] as string[],
    improvements: [] as string[],
    fixes: [] as string[],
    breakingChanges: [] as string[],
  };

  for (const pr of data.pullRequests) {
    const labels = pr.labels.map(label => label.toLowerCase());

    if (labels.includes('breaking')) {
      sections.breakingChanges.push(pr.title);
    } else if (labels.includes('feature')) {
      sections.features.push(pr.title);
    } else if (labels.includes('improvement')) {
      sections.improvements.push(pr.title);
    } else if (labels.includes('bugfix') || labels.includes('fix')) {
      sections.fixes.push(pr.title);
    } else {
      sections.improvements.push(pr.title);
    }
  }

  //call generate markdown 
  const markdown = this.generateMarkdown(
    {
      version: data.version,
      date: data.date,
      repository: data.repository,
    },
    sections,
  );

  //call generate highlights (non-AI)
  const highlights = this.generateHighlights({
    breakingChanges: sections.breakingChanges,
    features: sections.features,
    fixes: sections.fixes,
  });

  // call generate risks & notes
  const risksAndNotes = this.generateRisksAndNotes(
    { breakingChanges: sections.breakingChanges });

 
// AI part for highlights and risks & notes
let aiHighlights = highlights;
let aiRisks = risksAndNotes;

if (process.env.OPENAI_API_KEY) {
  console.log('[ReleaseNotesService] Attempting AI generation...');
  const prompt = buildAiPrompt(data.pullRequests);

let aiRaw = ''; // Ai response
let parsed; //take (Ai response) then parse from JSON to object

for (let attempt = 1; attempt <= 2; attempt++) {
  try {
    aiRaw = await this.aiService.generate(prompt);
    console.log('[ReleaseNotesService] AI raw response:', aiRaw);
    parsed = AiReleaseNotesSchema.parse(JSON.parse(aiRaw));
    console.log(`[ReleaseNotesService] AI generation successful on attempt ${attempt}`);
    break; 
  } catch (error) {
    console.log(`[ReleaseNotesService] AI parse failed on attempt ${attempt}:`, error.message);
    if (attempt === 2) {
      console.log('[ReleaseNotesService] Using fallback after 2 failed attempts');
      parsed = null; // fallback
    } else {
      console.log('[ReleaseNotesService] Retrying AI generation...');
    }
  }
}

// fallback
if (parsed) {
  aiHighlights = parsed.highlights;
  aiRisks = parsed.risksAndNotes;
} else {
  aiHighlights = highlights;
  aiRisks = risksAndNotes;
}

  // return 
  return {
    metadata: {
      version: data.version,
      date: data.date,
      repository: data.repository,
    },
    highlights: aiHighlights,
    sections,
    risksAndNotes: aiRisks,
    markdown,
  };
}
}
////////////////////////////////////////

//generate markdown function
private generateMarkdown(
  metadata: {            
    version: string;     
    date: string;         
    repository: string;   
  },
  sections: {
    features: string[];
    improvements: string[];
    fixes: string[];
    breakingChanges: string[];
  },
): string {

  let md = `## Release ${metadata.version}\n`;
  md += ` Date: ${metadata.date}\n`;
  md += ` Repository: ${metadata.repository}\n\n`;

  if (sections.features.length) {
    md += `###  Features\n`;
    sections.features.forEach(feature => {
      md += `- ${feature}\n`;
    });
    md += `\n`;
  }

  if (sections.improvements.length) {
    md += `###  Improvements\n`;
    sections.improvements.forEach(improvement => {
      md += `- ${improvement}\n`;
    });
    md += `\n`;
  }

  if (sections.fixes.length) {
    md += `###  Fixes\n`;
    sections.fixes.forEach(fix => {
      md += `- ${fix}\n`;
    });
    md += `\n`;
  }

  if (sections.breakingChanges.length) {
    md += `###  Breaking Changes\n`;
    sections.breakingChanges.forEach(breaking => {
      md += `- ${breaking}\n`;
    });
    md += `\n`;
  }

  return md;
}

//generate Highlights function
private generateHighlights(sections: {
  breakingChanges: string[];
  features: string[];
  fixes: string[];
}): string[] {
  const highlights: string[] = [];

  highlights.push(...sections.breakingChanges);
  highlights.push(...sections.features);
  highlights.push(...sections.fixes); 

  return highlights; 
}

//generate risks and notes

private generateRisksAndNotes(
  sections: {breakingChanges: string[];}
): string[] {
  const risksAndNotes: string[] = [];
// if there are breaking changes
  if (sections.breakingChanges.length > 0) {
    risksAndNotes.push(
      'Review breaking changes carefully before deploying to production.',
    );
  }
  return risksAndNotes.slice(0, 5);
}


}
