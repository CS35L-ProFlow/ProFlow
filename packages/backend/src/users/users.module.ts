import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from "../database/entities";

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UsersService],
	exports: [UsersService]
})
export class UsersModule { }
