import { Controller, Post, Get, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { User } from "../database/entities";
import { GetProjectResponse } from "../dtos/dtos.entity";

import { InviteMemberResult, ProjectService } from "./project.service";
import { CreateProjectRequest } from "../dtos/dtos.entity";
import { RequiredQuery } from "../decorators";

@ApiTags('project')
@Controller('project')
export class ProjectController {
	constructor(private project_service: ProjectService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@Get(":guid")
	async get_project_info(@AuthUser() user: User, @Param() params: { guid: string }): Promise<GetProjectResponse> {
		const { guid } = params;
		const project = await this.project_service.find_project(user, guid);
		if (!project) {
			throw new ForbiddenException("Project does not exist!");
		}
		return {
			name: project.name,
			owner: project.owner.guid,
			members: project.members.map(m => m.guid)
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@ApiQuery({ name: "invitee", required: true, description: "Invitee to project's email" })
	@Post(":guid/invite")
	async project_invite_member(@AuthUser() user: User, @Param() param: { guid: string }, @RequiredQuery("invitee") invitee: string) {
		const res = await this.project_service.project_invite_member(user, param.guid, invitee);
		if (res != InviteMemberResult.Success) {
			throw new ForbiddenException(res.toString());
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@Post(":guid/delete")
	async project_delete(@AuthUser() user: User, @Param() param: { guid: string }) {
		const deleted = await this.project_service.delete_project(user, param.guid);
		if (!deleted) {
			throw new ForbiddenException("Failed to delete project that you do not own!");
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post("create")
	async project_create(@AuthUser() user: User, @Body() req: CreateProjectRequest) {
		const created = await this.project_service.create_project(user, req.name);
		if (!created) {
			throw new ForbiddenException("Cannot create project with existing name!");
		}
	}

}
