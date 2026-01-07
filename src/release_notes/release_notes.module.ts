import { Module } from '@nestjs/common';
import { ReleaseNotesController } from './release_notes.controller';
import { ReleaseNotesService } from './release_notes.service';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ReleaseNotesController],
  providers: [ReleaseNotesService]
})
export class ReleaseNotesModule {}
