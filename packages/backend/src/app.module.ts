import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from "@nestjs/typeorm"

import { User, Project, Card, UserInvite } from "./database/entities"
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DATABASE_CONTAINER, DATABASE_PASSWORD, DATABASE_NAME } from "./env"


@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: DATABASE_CONTAINER,
			port: 3306,
			username: 'root',
			password: DATABASE_PASSWORD,
			database: DATABASE_NAME,
			entities: [User, Project, Card, UserInvite],
			synchronize: true,
		}),
		AuthModule,
		UsersModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
