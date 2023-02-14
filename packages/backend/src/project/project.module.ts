import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SubProjectController } from './sub_project.controller';
import { Project, UserInvite, SubProject, ProjectColumn } from "../database/entities";
import { UserModule } from "../user/user.module";
import { InviteController } from './invite.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Project, SubProject, UserInvite, ProjectColumn]), UserModule],
	providers: [ProjectService],
	controllers: [ProjectController, InviteController, SubProjectController],
})
export class ProjectModule { }
