import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggingMiddleware } from './shared/middlewares/logging.middleware';
import { ReleaseNotesModule } from './release_notes/release_notes.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, }), //تفعيل .env
    ReleaseNotesModule,
    ThrottlerModule.forRoot({throttlers: [{ ttl: 60,limit: 20,},],}),
    AiModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
