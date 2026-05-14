import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: true,
        credentials: true
    });
    app.use(passport.initialize());
    await app.listen(3000);
}
bootstrap();

// Trigger reload
