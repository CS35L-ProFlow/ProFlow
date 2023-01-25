import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';

import { LoginRequest, LoginResponse } from "../dtos/dtos.entity";

import { LoginService } from "./login.service";

@Controller('login')
export class LoginController {

	constructor(private login_service: LoginService) { }

	/*
	 * Attempts to authorize a user with a specific email and password.
	 * If the email-password combination is not found as a registered user in the database, then 401
	 * will be returned. It is intentionally unclear whether this is due to an incorrect password,
	 * username, or simply because the user was not signed up in the first place.
	 */
	@Post()
	async login(@Body() req: LoginRequest): Promise<LoginResponse> {
		const user = await this.login_service.get_user(req.email, req.password);
		if (!user)
			throw new HttpException("Failed to log-in. Either email or password does not match", HttpStatus.UNAUTHORIZED);

		console.log("User logged in: " + user.email);

		return { guid: user.guid };
	}

	/*
	 * Attempts to sign up a user with a given email and password.
	 * If the user already exists, then 401 unauthorized will be returned.
	 */
	@Post("signup")
	async signup(@Body() req: LoginRequest): Promise<LoginResponse> {
		{
			const user = await this.login_service.get_user(req.email, req.password);
			if (user) {
				console.log("Attempted to sign-up new user, but user already has account with matching password, logging in.")
				return { guid: user.guid };
			}
		}

		console.log("Adding new user " + req.email)
		const user = await this.login_service.create_user(req.email, req.password);

		if (!user)
			throw new HttpException("Failed to sign-up user: user already exists!", HttpStatus.UNAUTHORIZED);

		return { guid: user.guid };
	}

}
