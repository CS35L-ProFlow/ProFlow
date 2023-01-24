import { User } from "../database/entities";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";;

@Injectable()
export class LoginService {
	constructor(@InjectRepository(User) private user_repository: Repository<User>) { }

	async get_user(email: string, password: string): Promise<User | null> {
		return await this.user_repository.findOne({ where: { email, password } });
	}

	async create_user(email: string, password: string): Promise<User> {
		const user = new User();
		user.email = email;
		user.password = password;
		return await this.user_repository.save(user);
	}
}
