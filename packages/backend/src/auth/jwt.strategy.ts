import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { User } from "../database/entities";
import { UsersService } from "../users/users.service";
import { JWT_SECRET } from "../env";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private users_service: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: JWT_SECRET,
		});
	}

	// Called by PassportStrategy guard.
	async validate(payload: any): Promise<User> {
		const guid = payload.sub;
		const user = await this.users_service.find_user_with_guid(guid);
		return user!;
	}
}

