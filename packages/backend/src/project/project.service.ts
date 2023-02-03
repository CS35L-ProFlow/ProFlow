import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";;
import { Project, User, UserInvite } from "../database/entities";
import { UserService } from "../user/user.service";

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
		@InjectRepository(Project) private project_repository: Repository<Project>,
		@InjectRepository(UserInvite) private invite_repository: Repository<UserInvite>
	) { }

	async find_project(member: User, guid: string): Promise<Project | null> {
		const query = this.project_repository.createQueryBuilder("project");
		query.innerJoinAndSelect("project.members", "user")
			.andWhere("user.guid = :guid", { guid: member.guid })
			.andWhere("guid = :guid", { guid })
			.limit(1);
		return await query.getOne();
	}

	async find_owned_project(owner: User, guid: string): Promise<Project | null> {
		return await this.project_repository.findOne({ where: { owner, guid }, relations: { owner: true } });
	}

	async create_project(owner: User, name: string): Promise<Project | null> {
		const existing = await this.project_repository.findOne({ where: { name, owner }, relations: { owner: true } });
		if (existing) {
			console.log("Found existing project with same name and owner.");
			return null;
		}

		const db_project = await this.project_repository.save({ name, owner, members: [owner] });

		return db_project;
	}

	async delete_project(owner: User, guid: string): Promise<boolean> {
		const project = await this.project_repository.findOne({ where: { guid, owner }, relations: { owner: true } });

		if (!project) {
			return false;
		}

		await this.project_repository.delete({ guid });
		return true;
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

	async accept_invitation(invitee: User, guid: string): Promise<boolean> {
		const existing = await this.invite_repository.findOne({ where: { invitee, guid }, relations: ["invitee", "project", "project.members"] });
		if (!existing) {
			return false;
		}

		const project = existing.project;
		project.members.push(invitee);

		await this.invite_repository.delete({ guid });

		await this.project_repository.save(project);

		return true;
	}
}
