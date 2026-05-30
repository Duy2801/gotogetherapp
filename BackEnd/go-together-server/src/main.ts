import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { json, urlencoded } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true, limit: "10mb" }));

  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // Enable CORS for Socket.IO
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests from any origin for Socket.IO
      callback(null, true);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
