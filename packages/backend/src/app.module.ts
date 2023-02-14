import { Module } from '@nestjs/common';

import { TypeOrmModule } from "@nestjs/typeorm"

import { User, Project, Card, UserInvite, SubProject, ProjectColumn } from "./database/entities"
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DATABASE_CONTAINER, DATABASE_PASSWORD, DATABASE_NAME } from "./env"
import { ProjectModule } from './project/project.module';


@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: DATABASE_CONTAINER,
			port: 3306,
			username: 'root',
			password: DATABASE_PASSWORD,
			database: DATABASE_NAME,
			entities: [User, Project, Card, UserInvite, SubProject, ProjectColumn],
			synchronize: true,
		}),
		AuthModule,
		UserModule,
		ProjectModule
	],
})
export class AppModule { }
