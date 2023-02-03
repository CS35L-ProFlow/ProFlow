import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginRequest {
	/*
	 * The email of the user. Needs to be a valid email otherwise 400 will be returned.
	 */
	@IsNotEmpty()
	@IsEmail()
	email: string;

	/*
	 * The plain-text password of the user. This does not need to be hashed client side.
	 */
	@IsNotEmpty()
	password: string;
}

export class LoginResponse {
	/*
	 * The JSON Web Token (jwt) that is required to perform any authorized actions.
	 */
	jwt: string;

	/*
	 * The expire time of the jwt in seconds.
	 */
	expire_sec: number;
}

export class GetProjectsResponse {
	/*
	 * A list of project GUIDs.
	 */
	project_guids: string[];
}

export class GetInvitesResponse {
	/*
	 * A list of project invite GUIDs.
	 */
	invite_guids: string[];
}

export class CreateProjectRequest {
	/*
	 * Name of the project.
	 */
	@IsNotEmpty()
	name: string;
}

