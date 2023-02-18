import { Controller, Post, Get, Param, Body, UseGuards, ForbiddenException, Query, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, AuthUser } from "../auth/jwt.guard";
import { User, SubProject } from "../database/entities";
import { GetProjectResponse, GetProjectTreeResponse, SubProjectResponse, GetColumnCardsResponse } from "../dtos/dtos.entity";

import { InviteMemberResult, ProjectService } from "./project.service";
import { CreateSubProjectRequest, CreateProjectRequest, CreateProjectColumnRequest } from "../dtos/dtos.entity";
import { RequiredQuery } from "../decorators";

@ApiTags('project')
@Controller('project')
export class ProjectController {
	constructor(private project_service: ProjectService) { }

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@Get(":guid")
	async get_project_info(@Param() params: { guid: string }): Promise<GetProjectResponse> {
		const { guid } = params;
		const project = await this.project_service.find_project(guid);
		if (!project) {
			throw new ForbiddenException("Project does not exist!");
		}
		return {
			name: project.name,
			guid: project.guid,
			owner: project.owner.guid,
			members: project.members.map(m => m.guid),
			columns: project.project_columns.map(m => { return { name: m.name, guid: m.guid } })
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@Get(":guid/sub-projects")
	async get_sub_projects(@Param() param: { guid: string }): Promise<GetProjectTreeResponse> {
		const project = await this.project_service.find_project(param.guid);
		if (!project) {
			throw new ForbiddenException("Project does not exist!");
		}

		const sub_projects = await this.project_service.fetch_subprojects(project);
		const to_response = (sub_project: SubProject): SubProjectResponse => {
			return {
				name: sub_project.name,
				guid: sub_project.guid,
				project: sub_project.project.guid,
				children: sub_project.children.map(to_response),
				parent_guid: sub_project.parent?.guid
			}
		}

		return {
			name: project.name,
			guid: project.guid,
			owner: project.owner.guid,
			sub_projects: sub_projects.map(to_response),
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
	@ApiQuery({ name: "parent", required: false, description: "Parent sub-project GUID" })
	@Post(":guid/sub-project/create")
	async create_sub_project(
		@AuthUser() user: User,
		@Param() param: { guid: string },
		@Query("parent") parent_sub_project_guid: string | undefined,
		@Body() req: CreateSubProjectRequest
	) {
		const project = await this.project_service.find_project(param.guid);
		if (!project) {
			throw new ForbiddenException("Project does not exist!");
		}

		let parent: SubProject | null = null;
		if (parent_sub_project_guid) {
			parent = await this.project_service.find_sub_project(user, parent_sub_project_guid);
			if (!parent) {
				throw new ForbiddenException("Parent sub-project does not exist!");
			}
		}
		const res = await this.project_service.create_sub_project(user, project, req.name, parent ?? undefined);
		if (res.err) {
			throw new ForbiddenException(res.val);
		}
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiParam({ name: "guid", required: true, description: "Project GUID" })
	@Post(":guid/add-column")
	async add_column(@AuthUser() user: User, @Param() param: { guid: string }, @Body() req: CreateProjectColumnRequest) {
		const res = await this.project_service.add_column(user, param.guid, req.name);
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
