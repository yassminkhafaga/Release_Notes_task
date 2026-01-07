import { Controller, Post, UseGuards } from '@nestjs/common';
import { ReleaseNotesService } from './release_notes.service';
import { Body } from '@nestjs/common';
import { ReleaseNotesDto } from '../release_notes/dto/release_notes.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard) //for rate limit 
@Controller('api/release-notes')
export class ReleaseNotesController {
    constructor(private readonly releaseNotesService: ReleaseNotesService) {}

    @Post()
    generate(@Body() body: ReleaseNotesDto) {
        return this.releaseNotesService.generateReleaseNotes(body);
    }
}
