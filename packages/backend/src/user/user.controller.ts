import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from "../database/entities";
import { GetProjectsResponse, GetInvitesResponse } from "../dtos/dtos.entity";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
	constructor(private user_service: UserService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("projects")
	async get_projects(@AuthUser() user: User): Promise<GetProjectsResponse> {
		const projects = await this.user_service.get_user_projects(user);
		return { project_guids: projects.map(project => project.guid) };
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("invites")
	async get_invites(@AuthUser() user: User): Promise<GetInvitesResponse> {
		const invites = await this.user_service.get_user_invites(user);
		return { invite_guids: invites.map(invite => invite.guid) };
	}
}
