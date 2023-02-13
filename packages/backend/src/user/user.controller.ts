import { Controller, UseGuards, Get, Param, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { ApiBearerAuth, ApiTags, ApiParam } from '@nestjs/swagger';
import { User } from "../database/entities";
import { GetProjectListResponse, GetInvitesResponse, GetUserResponse } from "../dtos/dtos.entity";
import { UserService } from "./user.service";

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(private user_service: UserService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("projects")
	async get_user_projects(@AuthUser() user: User): Promise<GetProjectListResponse> {
		const projects = await this.user_service.get_user_projects(user);
		return { project_guids: projects.map(project => project.guid) };
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("invites")
	async get_user_invites(@AuthUser() user: User): Promise<GetInvitesResponse> {
		const invites = await this.user_service.get_user_invites(user);
		return { invite_guids: invites.map(invite => invite.guid) };
	}

	@ApiParam({ name: "guid", required: true, description: "User GUID" })
	@Get(":guid/query")
	async query_user(@Param() param: { guid: string }): Promise<GetUserResponse> {
		const user = await this.user_service.find_user_with_guid(param.guid);
		if (!user) {
			throw new ForbiddenException("User does not exist!");
		}

		return { email: user.email, guid: user.guid };
	}

}
