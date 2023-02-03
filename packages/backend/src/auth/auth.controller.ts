import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LoginRequest, LoginResponse } from "../dtos/dtos.entity";
import { AuthService } from "./auth.service";
import { JwtAuthGuard, AuthUser } from "./jwt.guard";
import { User } from "../database/entities";
import { JWT_EXPIRE_SEC } from "../env";

@Controller('auth')
export class AuthController {
	constructor(private auth_service: AuthService) {

	}

	@Post("login")
	async login(@Body() req: LoginRequest): Promise<LoginResponse> {
		const user = await this.auth_service.validate(req.email, req.password);
		if (!user) {
			console.log("Credentials invalid!");
			throw new UnauthorizedException("Invalid credentials!");
		}

		console.log("User successfully logged in! " + user.email);

		const jwt = this.auth_service.login(user);

		return { jwt, expire_sec: JWT_EXPIRE_SEC };
	}

	@UseGuards(JwtAuthGuard)
	@Post("refresh")
	async refresh(@AuthUser() user: User): Promise<LoginResponse> {
		const jwt = this.auth_service.login(user);

		return { jwt, expire_sec: JWT_EXPIRE_SEC };
	}

	@Post("signup")
	async signup(@Body() req: LoginRequest) {
		const res = await this.auth_service.signup(req.email, req.password);

		if (!res) {
			throw new UnauthorizedException("User with email already exists!");
		}

		return await this.login(req);
	}
}
