import { Controller, Post, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, } from '@nestjs/swagger';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { User } from "../database/entities";

import { ProjectService } from "./project.service";

@Controller('invite')
export class InviteController {
	constructor(private project_service: ProjectService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@Post(":guid/accept")
	async project_invite_member(@AuthUser() user: User, @Param() param: { guid: string }) {
		const res = await this.project_service.accept_invitation(user, param.guid);
		if (!res) {
			throw new ForbiddenException("Failed to accept invitation!");
		}
	}
}
