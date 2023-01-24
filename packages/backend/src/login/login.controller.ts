import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from "class-validator";

import { LoginService } from "./login.service";

export class LoginRequest {
	@IsNotEmpty()
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsNotEmpty()
	@ApiProperty()
	password: string;
}

export class LoginResponse {
	guid?: string;
}

@Controller('login')
export class LoginController {

	constructor(private login_service: LoginService) { }

	@Post()
	async login(@Body() req: LoginRequest) {
		const user = await this.login_service.get_user(req.email, req.password);
		if (!user) {
			console.log("Failed to log-in new user. Password either doesn't match or the user has not signed up before.")
			return {};
		}

		console.log("User logged in: " + user.email);

		return { guid: user.guid };
	}

	@Post("signup")
	async signup(@Body() req: LoginRequest): Promise<LoginResponse> {
		{
			const user = await this.login_service.get_user(req.email, req.password);
			if (user) {
				console.log("Attempted to sign-up new user, but user already has account with matching password, signing up.")
				this.login(req);
				return { guid: user.guid };
			}
		}

		console.log("Adding new user " + req.email)
		const user = await this.login_service.create_user(req.email, req.password);

		// throw new HttpException("User already has an account!", HttpStatus.FORBIDDEN);

		return { guid: user.guid };
	}

}
