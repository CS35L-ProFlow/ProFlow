import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";;

import { User } from "../database/entities";

declare function assert(value: unknown): asserts value;

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private user_repository: Repository<User>) { }

	async find_user_with_email(email: string): Promise<User | null> {
		return await this.user_repository.findOne({ where: { email } });
	}

	async create_user(email: string, password: string): Promise<User> {
		assert(await this.find_user_with_email(email));

		const user = new User();
		user.email = email;
		user.password = password;
		return await this.user_repository.save(user);
	}

	async find_user_with_guid(guid: string): Promise<User | null> {
		return await this.user_repository.findOne({ where: { guid } });
	}
}
