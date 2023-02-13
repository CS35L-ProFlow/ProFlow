import { Injectable } from '@nestjs/common';
import { InjectRepository, } from "@nestjs/typeorm";
import { Repository, TreeRepository, DataSource } from "typeorm";
import { Project, SubProject, User, UserInvite, ProjectColumn } from "../database/entities";
import { UserService } from "../user/user.service";
import { Ok, Err, Result } from "ts-results";

export enum InviteMemberResult {
	Success = "Successfully invited member!",
	SelfInvite = "You can't invite yourself to your own project!",
	ProjectDoesNotExist = "Project does not exist or you are not the owner!",
	UserDoesNotExist = "User does not exist!",
	InvitationAlreadySent = "This user already has an invitation!",
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
				console.log("Found existing project with same name and owner.");
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

	async add_column(owner: User, guid: string, name: string): Promise<Result<void, string>> {
		return await this.data_source.transaction(async manager => {
			const project = await manager.findOne(Project, { where: { guid }, relations: { owner: true } });
			if (!project) {
				return Err("Cannot add column to project that does not exist!");
			}

			if (project.owner.guid != owner.guid) {
				return Err("Cannot add column to project that you do not own!");
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

	async create_sub_project(owner: User, project: Project, name: string, parent?: SubProject): Promise<Result<SubProject, string>> {
		return await this.data_source.transaction(async manager => {
			if (project.owner.guid != owner.guid) {
				console.log("Failed to create sub-project of project that user does not own.")
				return Err("Cannot create sub-project for project that you do not own!");
			}
			const existing = await manager.findOne(SubProject, { where: { project, name }, relations: { project: true } });
			if (existing) {
				console.log("Found existing subproject with same name and parent project.");
				return Err("Existing sub-project with same name already exists!");
			}

			const sub_project = await manager.save(SubProject, { name, parent, project });
			return Ok(sub_project);
		});
	}

	async delete_sub_project(owner: User, guid: string): Promise<Result<void, string>> {
		// NOTE(Brandon): Technically, this can cause a race condition if the same owner sends two requests to delete the same sub project, but we won't worry about it
		// because a) it's very rare, and b) no real consequences happen other than a bad error message.
		const existing = await this.find_sub_project(owner, guid);
		if (!existing) {
			console.log("Failed to delete non-existant sub-project")
			return Err("Sub-project does not exist!");
		}

		if (existing.project.owner.guid != owner.guid) {
			console.log("Failed to delete sub-project that user does not own.")
			return Err("Cannot delete sub-project that you do not own!");
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
			return InviteMemberResult.UserDoesNotExist;
		}

		const invitee = await this.user_service.find_user_with_email(invitee_email);
		if (!invitee) {
			return InviteMemberResult.ProjectDoesNotExist;
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
