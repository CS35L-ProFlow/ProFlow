import { Controller, Post, Get, Body, Param, UseGuards, ForbiddenException, Query, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { User } from "../database/entities";
import { AddCardRequest } from "../dtos/dtos.entity";
import { GetColumnCardsResponse } from "../dtos/dtos.entity";

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

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Sub-Project GUID" })
	@ApiQuery({ name: "column", required: true, description: "The project column GUID to get the cards for" })
	@ApiQuery({ name: "assignee", required: false, description: "The assignee user GUID of the card to search for" })
	@Get(":guid/cards")
	async get_cards(
		@AuthUser() user: User,
		@Param() param: { guid: string },
		@Query("column") column: string,
		@Query("assignee") assignee?: string,
	): Promise<GetColumnCardsResponse> {

		const res = await this.project_service.find_cards(user, {
			sub_project_guid: param.guid,
			column_guid: column,
			assignee_guid: assignee
		});
		if (res.err) {
			throw new ForbiddenException(res.val);
		}
		const { cards, project, project_column } = res.val;
		if (!project_column) {
			throw new InternalServerErrorException("Something went wrong getting the project column!");
		}

		return {
			column,
			column_name: project_column.name,
			cards: cards.map(c => {
				return {
					guid: c.guid,
					title: c.title,
					description: c.description,
					assignee: c.assignee?.guid,
					project_guid: project.guid,
					sub_project_guid: param.guid,
					priority: c.priority,
					date_created: c.date_created,
					date_modified: c.date_modified,
				}
			})
		}
	}
}
