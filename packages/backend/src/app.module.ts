import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from "@nestjs/typeorm"

import { User, Project, Card } from "./database/entities"
import { LoginModule } from './login/login.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: process.env["DATABASE_CONTAINER"],
			port: 3306,
			username: 'root',
			password: process.env["DATABASE_PASSWORD"],
			database: process.env["DATABASE_NAME"],
			entities: [User, Project, Card],
			synchronize: true,
		}),
		LoginModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
