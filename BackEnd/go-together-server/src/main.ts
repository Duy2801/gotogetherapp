import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { ValidationPipe, VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // Enable CORS for Socket.IO
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("GoToGeTher API")
    .setDescription("API documentation for GoToGeTher Backend")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, document);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
