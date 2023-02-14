import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";;

import { Project, User, UserInvite } from "../database/entities";


@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private user_repository: Repository<User>,) { }

	async find_user_with_email(email: string): Promise<User | null> {
		return await this.user_repository.findOne({ where: { email } });
	}

	async create_user(email: string, password: string): Promise<User | null> {
		if (await this.find_user_with_email(email)) {
			return null;
		}

		return await this.user_repository.save({ email, password });
	}

	async find_user_with_guid(guid: string): Promise<User | null> {
		return await this.user_repository.findOne({ where: { guid } });
	}

	async get_user_projects(user: User): Promise<Project[]> {
		const res = await this.user_repository.findOne({ where: { guid: user.guid }, relations: { projects: true } });
		return res!.projects;
	}

	async get_user_invites(user: User): Promise<UserInvite[]> {
		const res = await this.user_repository.findOne({ where: { guid: user.guid }, relations: { invites: true } });
		return res!.invites;
	}
}
