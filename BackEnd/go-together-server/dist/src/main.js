"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: "1",
    });
    app.enableCors({
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle("GoToGeTher API")
        .setDescription("API documentation for GoToGeTher Backend")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document);
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    await app.listen(3000);
    console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
//# sourceMappingURL=main.js.map