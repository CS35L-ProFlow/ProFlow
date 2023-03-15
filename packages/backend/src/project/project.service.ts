import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, TreeRepository, DataSource, Between, EntityManager, MoreThanOrEqual, UpdateResult, Like, FindOperator } from "typeorm";
import { Project, SubProject, User, UserInvite, ProjectColumn, Card } from "../database/entities";
import { UserService } from "../user/user.service";
import { Ok, Err, Result } from "ts-results";

export enum InviteMemberResult {
	Success = "Successfully invited member!",
	SelfInvite = "You can't invite yourself to your own project!",
	ProjectDoesNotExist = "Project does not exist or you are not the owner!",
	UserDoesNotExist = "User does not exist!",
	InvitationAlreadySent = "This user already has an invitation!",
	AlreadyInProject = "This user already is a part of the project!",
}

@Injectable()
export class ProjectService {
	constructor(private user_service: UserService,
		private data_source: DataSource,
		@InjectRepository(Project) private project_repository: Repository<Project>,
		@InjectRepository(SubProject) private sub_project_repository: TreeRepository<SubProject>,
		@InjectRepository(UserInvite) private invite_repository: Repository<UserInvite>
	) { }

	// NOTE(Brandon): This does not actually fetch the sub-projects, you must do that separately
	async find_project(guid: string): Promise<Project | null> {
		const query = this.project_repository.createQueryBuilder("project");
		query
			.innerJoinAndSelect("project.owner", "owner")
			.leftJoinAndSelect("project.members", "member")
			.leftJoinAndSelect("project.project_columns", "project_columns")
			.where("project.guid = :guid", { guid })
			.orderBy("project_columns.order_index", "ASC");
		return await query.getOne();
	}

	async find_owned_project(owner: User, guid: string): Promise<Project | null> {
		return await this.project_repository.findOne({ where: { owner, guid }, relations: { owner: true, members: true } });
	}

	async fetch_subprojects(project: Project): Promise<SubProject[]> {
		// TODO(Brandon): This could potentially be super expensive if there are a lot of sub-projects because we are loaded _all_ of them first.
		// Ideally, we would filter in the query, but TBH I don't know how.
		const all = await this.sub_project_repository.findTrees({ relations: ["project", "parent"] });
		return all.filter(p => p.project.guid == project.guid);
	}

	async create_project(owner: User, name: string): Promise<Project | null> {
		return await this.data_source.transaction(async manager => {
			const existing = await manager.findOne(Project, { where: { name, owner }, relations: { owner: true, members: true } });
			if (existing) {
				return null;
			}

			const db_project = await manager.save(Project, { name, owner, members: [owner] });

			return db_project;
		});
	}

	async delete_project(owner: User, guid: string): Promise<boolean> {
		return await this.data_source.transaction(async manager => {
			const project = await manager.findOne(Project, { where: { guid, owner }, relations: { owner: true, members: true } });

			if (!project) {
				return false;
			}

			await manager.delete(Project, { guid });
			return true;
		});
	}

	async add_column(user: User, guid: string, name: string): Promise<Result<void, string>> {
		return await this.data_source.transaction(async manager => {
			const project = await manager.findOne(Project, { where: { guid }, relations: { members: true } });
			if (!project) {
				return Err("Cannot add column to project that does not exist!");
			}

			if (!project.members.find(m => m.guid == user.guid)) {
				return Err("User is not a member of the project and cannot add a column!")
			}

			const existing = await manager.findOne(ProjectColumn, { where: { name, project }, relations: { project: true } });
			if (existing) {
				return Err("Cannot create column in project with duplicate name!");
			}

			const res = await manager
				.createQueryBuilder(ProjectColumn, "project_column")
				.orderBy({ order_index: "DESC" })
				.limit(1).getOne();
			const highest_order = res?.order_index ?? -1;

			const order_index = highest_order + 1;
			await manager.save(ProjectColumn, { name, order_index, project });

			return Ok.EMPTY;
		});
	}

	async delete_column(user: User, guid: string, column_guid: string): Promise<Result<void, string>> {
		return await this.data_source.transaction(async manager => {
			const project = await manager.findOne(Project, { where: { guid }, relations: { members: true } });
			if (!project) {
				return Err("Cannot delete column in project that does not exist!");
			}

			if (!project.members.find(m => m.guid == user.guid)) {
				return Err("User is not a member of the project and cannot delete a column!")
			}

			const existing = await manager.findOne(ProjectColumn, { where: { guid: column_guid, project }, relations: { project: true } });
			if (!existing) {
				return Err("Column does not exist!");
			}

			await manager.delete(ProjectColumn, { guid: column_guid });

			return Ok.EMPTY;
		});
	}

	async rename_column(user: User, guid: string, column_guid: string, new_name: string): Promise<Result<void, string>> {
		return await this.data_source.transaction(async manager => {
			const project = await manager.findOne(Project, { where: { guid }, relations: { members: true } });
			if (!project) {
				return Err("Cannot rename column in project that does not exist!");
			}

			if (!project.members.find(m => m.guid == user.guid)) {
				return Err("User is not a member of the project and cannot rename a column!")
			}

			const existing = await manager.findOne(ProjectColumn, { where: { guid: column_guid, project }, relations: { project: true } });
			if (!existing) {
				return Err("Column does not exist!");
			}

			existing.name = new_name;

			await manager.save(ProjectColumn, existing);

			return Ok.EMPTY;
		});
	}

	async add_card_to_column(
		user: User,
		sub_project_guid: string,
		column_guid: string,
		title: string,
		description: string,
		assignee_guid?: string
	): Promise<Result<void, string>> {
		return await this.data_source.transaction(async manager => {
			const sub_project = await manager.findOne(SubProject, { where: { guid: sub_project_guid }, relations: ["project", "project.members"] })
			if (!sub_project)
				return Err("Cannot add column to project that does not exist!");

			if (!sub_project.project.members.find(m => m.guid == user.guid)) {
				return Err("User is not a member of the project and cannot add a card!")
			}

			let assignee: User | undefined = undefined;
			if (assignee_guid) {
				assignee = sub_project.project.members.find(m => m.guid == assignee_guid);
				if (!assignee)
					return Err("Assignee is not a member of the project!");
			}

			const project_column = await manager.findOne(ProjectColumn, { where: { guid: column_guid } });
			if (!project_column) {
				return Err("Column does not exist!")
			}

			const highest_card = await manager
				.createQueryBuilder(Card, "card")
				.where({ project_column, })
				.orderBy({ priority: "DESC" })
				.limit(1)
				.getOne();
			const highest_priority = highest_card?.priority ?? -1;
			const priority = highest_priority + 1;

			await manager.save(Card, {
				title,
				description,
				sub_project,
				project_column,
				assignee,
				priority
			});

			return Ok.EMPTY;
		});
	}

	private async fill_card_priority_hole(
		manager: EntityManager,
		project_column: ProjectColumn,
		old_priority?: number,
		new_priority?: number
	): Promise<UpdateResult | undefined> {
		if (old_priority == undefined && new_priority == undefined)
			return undefined;

		if (old_priority == undefined) {
			return manager.createQueryBuilder()
				.update(Card)
				.set({ priority: () => "priority + 1" })
				.where({
					project_column,
					priority: MoreThanOrEqual(new_priority),
				}).execute();
		}

		if (new_priority == undefined) {
			return manager.createQueryBuilder()
				.update(Card)
				.set({ priority: () => "priority - 1" })
				.where({
					project_column,
					priority: MoreThanOrEqual(old_priority),
				}).execute();
		}

		if (new_priority < old_priority) {
			return await manager.createQueryBuilder()
				.update(Card)
				.set({ priority: () => "priority + 1" })
				.where({
					project_column,
					priority: Between(new_priority, old_priority - 1)
				}).execute();
		} else if (new_priority > old_priority) {
			return await manager.createQueryBuilder()
				.update(Card)
				.set({ priority: () => "priority - 1" })
				.where({
					project_column,
					priority: Between(old_priority + 1, new_priority)
				}).execute();
		}
	}

	async delete_card(user: User, sub_project_guid: string, guid: string): Promise<Result<void, string>> {
		return await this.data_source.transaction(async manager => {
			const sub_project = await manager.findOne(SubProject, { where: { guid: sub_project_guid }, relations: ["project", "project.members"] })
			if (!sub_project)
				return Err("Cannot add column to project that does not exist!");

			if (!sub_project.project.members.find(m => m.guid == user.guid)) {
				return Err("User is not a member of the project and cannot add a card!")
			}

			const card = await manager.findOne(Card, { where: { guid }, relations: ["project_column", "assignee"] })

			if (!card) {
				return Err("Card does not exist!");
			}

			await this.fill_card_priority_hole(manager, card.project_column, card.priority);

			await manager.delete(Card, { guid });

			return Ok.EMPTY;
		});
	}

	async edit_card(
		user: User,
		sub_project_guid: string,
		guid: string,
		edits: {
			priority?: number,
			title?: string,
			description?: string,
			assignee?: string,
			column?: string
		}): Promise<Result<void, string>> {
		if (edits.priority && edits.priority < 0) {
			return Err("Priority cannot be negative!");
		}

		return await this.data_source.transaction(async manager => {
			const sub_project = await manager.findOne(SubProject, { where: { guid: sub_project_guid }, relations: ["project", "project.members"] })
			if (!sub_project)
				return Err("Cannot edit card in sub project that does not exist!");

			if (!sub_project.project.members.find(m => m.guid == user.guid)) {
				return Err("User is not a member of the project and cannot add a card!")
			}

			const card = await manager.findOne(Card, { where: { guid }, relations: ["project_column", "assignee"] })

			if (!card) {
				return Err("Card does not exist!");
			}

			if (edits.title && card.title != edits.title) {
				card.title = edits.title;
			}

			if (edits.description && card.description != edits.description) {
				card.description = edits.description;
			}

			if (edits.assignee) {
				if (edits.assignee === "NONE") {
					card.assignee = null;
				} else if (card.assignee?.guid != edits.assignee) {

					const new_assignee = sub_project.project.members.find(m => m.guid == edits.assignee);

					if (!new_assignee) {
						return Err("Assignee is not a member of the project!");
					}

					card.assignee = new_assignee;
				}
			}

			const changed_columns = edits.column && card.project_column.guid != edits.column;
			if (changed_columns) {

				const column = await manager.findOne(ProjectColumn, { where: { guid: edits.column } })
				if (!column) {
					return Err("Column does not exist!");
				}

				await this.fill_card_priority_hole(manager, card.project_column, card.priority, undefined);

				// TODO(Brandon): Probably want to add a check to make sure that the column is actually a part of the project...

				card.project_column = column;
			}

			if (edits.priority != undefined && (card.priority != edits.priority || changed_columns)) {
				await this.fill_card_priority_hole(manager, card.project_column, changed_columns ? undefined : card.priority, edits.priority);

				const highest_card = await manager
					.createQueryBuilder(Card, "card")
					.where({ project_column: card.project_column, })
					.orderBy({ priority: "DESC" })
					.limit(1)
					.getOne();

				const highest_priority = (highest_card?.priority ?? -1) + 1;
				card.priority = Math.min(edits.priority, highest_priority);
			}

			await manager.save(Card, card);

			return Ok.EMPTY;
		});
	}


	async find_cards(user: User, where: {
		project_guid?: string,
		sub_project_guid?: string,
		column_guid?: string,
		assignee_guid?: string,
		filter?: string,
	}): Promise<Result<{ cards: Card[], project: Project, project_column?: ProjectColumn }, string>> {
		return await this.data_source.transaction(async manager => {
			if (!where.project_guid && !where.sub_project_guid) {
				return Err("");
			}
			let project: Project | undefined = undefined;
			let sub_project: SubProject | undefined = undefined;
			if (where.project_guid) {
				project = await manager.findOne(Project, { where: { guid: where.project_guid }, relations: { members: true } }) ?? undefined;
				if (!project) {
					return Err("Project does not exist!");
				}
				if (!project.members.find(m => m.guid == user.guid)) {
					return Err("User is not a member of this project!");
				}
			}

			if (where.sub_project_guid) {
				sub_project = await manager.findOne(SubProject, { where: { guid: where.sub_project_guid }, relations: ["project", "project.members"] }) ?? undefined;
				if (!sub_project) {
					return Err("Sub-project does not exist!");
				}
				project = sub_project.project;
			}

			if (!project) {
				return Err("Failed to find project!");
			}

			let project_column: ProjectColumn | undefined = undefined;
			if (where.column_guid) {
				project_column = await manager.findOne(ProjectColumn, { where: { guid: where.column_guid, project } }) ?? undefined;
				if (!project_column) {
					return Err("Column does not exist!");
				}
			}

			let assignee: User | undefined = undefined;
			if (where.assignee_guid) {
				assignee = project.members.find(m => m.guid == where.assignee_guid);
				if (!assignee) {
					return Err("Assignee does not exist in project!");
				}
			}

			let title: FindOperator<string> | undefined = undefined;
			if (where.filter) {
				title = Like(`%${where.filter}%`);
			}

			const cards = await manager.find(Card,
				{
					where: {
						sub_project,
						project_column,
						assignee,
						title
					},
					order: { priority: "ASC" },
					relations: { assignee: true }
				})
			return Ok({ cards, project_column, project });
		});
	}

	// NOTE(Brandon): Does not actually fetch the child sub-projects, you must do that separately
	async find_sub_project(member: User, guid: string): Promise<SubProject | null> {
		const query = this.sub_project_repository.createQueryBuilder("sub_project");
		query
			.innerJoinAndSelect("sub_project.project", "project")
			.innerJoinAndSelect("project.owner", "owner")
			.innerJoinAndSelect("project.members", "member", "member.guid = :member_guid", { member_guid: member.guid })
			.where("sub_project.guid = :sub_project_guid", { sub_project_guid: guid })
			.limit(1);
		return await query.getOne();
	}

	async create_sub_project(member: User, project: Project, name: string, parent?: SubProject): Promise<Result<SubProject, string>> {
		return await this.data_source.transaction(async manager => {
			if (!project.members.find(m => m.guid == member.guid)) {
				return Err("User is not a member of the project and cannot create a sub-project!")
			}
			const existing = await manager.findOne(SubProject, { where: { project, name }, relations: { project: true } });
			if (existing) {
				return Err("Existing sub-project with same name already exists!");
			}

			const sub_project = await manager.save(SubProject, { name, parent, project });
			return Ok(sub_project);
		});
	}

	async delete_sub_project(member: User, guid: string): Promise<Result<void, string>> {
		const existing = await this.find_sub_project(member, guid);
		if (!existing) {
			return Err("Sub-project does not exist!");
		}

		if (!existing.project.members.find(m => m.guid == member.guid)) {
			return Err("User is not a member of the project and cannot delete a sub-project!")
		}

		await this.sub_project_repository.delete({ guid });
		return Ok.EMPTY;
	}

	async project_invite_member(owner: User, project_guid: string, invitee_email: string): Promise<InviteMemberResult> {
		if (owner.email === invitee_email) {
			return InviteMemberResult.SelfInvite;
		}
		const project = await this.find_owned_project(owner, project_guid);
		if (!project) {
			return InviteMemberResult.ProjectDoesNotExist;
		}

		const invitee = await this.user_service.find_user_with_email(invitee_email);
		if (!invitee) {
			return InviteMemberResult.UserDoesNotExist;
		}

		if (project.members.find(m => m.guid == invitee.guid)) {
			return InviteMemberResult.AlreadyInProject;
		}

		if (await this.invite_repository.findOne({ where: { invitee, project }, relations: { invitee: true, project: true } })) {
			return InviteMemberResult.InvitationAlreadySent;
		}

		await this.invite_repository.save({ invitee, project });

		return InviteMemberResult.Success;
	}

	async find_invitiation(invitee: User, guid: string): Promise<UserInvite | null> {
		const existing = await this.invite_repository.findOne({ where: { invitee, guid }, relations: ["invitee", "project", "project.owner"] });
		return existing;
	}

	async accept_invitation(invitee: User, guid: string): Promise<boolean> {
		return await this.data_source.transaction(async manager => {
			const existing = await manager.findOne(UserInvite, { where: { invitee, guid }, relations: ["invitee", "project", "project.members"] });
			if (!existing) {
				return false;
			}

			const project = existing.project;
			project.members.push(invitee);

			await manager.delete(UserInvite, { guid });

			await manager.save(project);

			return true;
		});
	}
}
