import { Controller, Post, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { User } from "../database/entities";
import { GetInvitationResponse } from "../dtos/dtos.entity";

import { ProjectService } from "./project.service";

@ApiTags('invite')
@Controller('invite')
export class InviteController {
	constructor(private project_service: ProjectService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Invitation GUID" })
	@Get(":guid")
	async project_get_invitation(@AuthUser() user: User, @Param() param: { guid: string }): Promise<GetInvitationResponse> {
		const res = await this.project_service.find_invitiation(user, param.guid);
		if (!res) {
			throw new ForbiddenException("Invitation does not exist!");
		}

		return {
			project_guid: res.project.guid,
			project_name: res.project.name,
			owner_guid: res.project.owner.guid,
			owner_email: res.project.owner.email
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Invitation GUID" })
	@Post(":guid/accept")
	async project_accept_invitation(@AuthUser() user: User, @Param() param: { guid: string }) {
		const res = await this.project_service.accept_invitation(user, param.guid);
		if (!res) {
			throw new ForbiddenException("Failed to accept invitation!");
		}
	}
}
