import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project, UserInvite } from "../database/entities";
import { UserModule } from "../user/user.module";
import { InviteController } from './invite.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Project, UserInvite]), UserModule],
	providers: [ProjectService],
	controllers: [ProjectController, InviteController],
})
export class ProjectModule { }
