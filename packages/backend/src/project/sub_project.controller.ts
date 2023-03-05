import { Controller, Post, Get, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { User } from "../database/entities";
import { AddCardRequest } from "../dtos/dtos.entity";

import { ProjectService } from "./project.service";

@ApiTags('sub-project')
@Controller('sub-project')
export class SubProjectController {
	constructor(private project_service: ProjectService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Sub-Project GUID" })
	@Post(":guid/delete")
	async delete_sub_project(
		@AuthUser() user: User,
		@Param() param: { guid: string },
	) {
		const res = await this.project_service.delete_sub_project(user, param.guid);
		if (res.err) {
			throw new ForbiddenException(res.val);
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Sub-Project GUID" })
	@Post(":guid/add-card")
	async add_card(
		@AuthUser() user: User,
		@Param() param: { guid: string },
		@Body() req: AddCardRequest,
	) {
		const res = await this.project_service.add_card_to_column(user, param.guid, req.column, req.title, req.description, req.assignee);
		if (res.err) {
			throw new ForbiddenException(res.val);
		}
	}
}
