import { Injectable } from '@nestjs/common';

import { UsersService } from "../users/users.service";
import { User } from "../database/entities";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
	constructor(private users_service: UsersService, private jwt_service: JwtService) { }

	async validate(email: string, password: string): Promise<User | null> {
		email = email.toLowerCase();

		const db_user = await this.users_service.find_user_with_email(email);
		if (!db_user) {
			console.log("No user with email " + email);
			return null;
		}

		if (!await bcrypt.compare(password, db_user.password)) {
			console.log("Password does not match!");
			return null;
		}

		console.log("User successfully logged in! " + email);

		return db_user;
	}

	login(user: User): string {
		const payload: any = { sub: user.guid };
		return this.jwt_service.sign(payload);
	}

	async signup(email: string, password: string): Promise<boolean> {
		email = email.toLowerCase();
		if (await this.users_service.find_user_with_email(email)) {
			console.log("User already exists! " + email);
			return false;
		}

		const salt = await bcrypt.genSalt();
		console.log("Salt " + salt);
		const hash = await bcrypt.hash(password, salt);
		console.log("Hash " + hash);

		const db_user = await this.users_service.create_user(email, hash);
		console.log("New user signed up: " + db_user.email);

		return true;
	}
}
