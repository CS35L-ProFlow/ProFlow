import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());

	const config = new DocumentBuilder()
		.setTitle("CS35L Final Project")
		.setDescription("CS35L Final Project backend API description")
		.setVersion("1.0")
		.build();

	const doc = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, doc);

	await app.listen(process.env["BACKEND_PORT"]);
}
bootstrap();
