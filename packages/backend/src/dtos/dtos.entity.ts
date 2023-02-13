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
	 * The user's GUID.
	 */
	user_guid: string;

	/*
	 * The JSON Web Token (jwt) that is required to perform any authorized actions.
	 */
	jwt: string;

	/*
	 * The expire time of the jwt in seconds.
	 */
	expire_sec: number;
}

export class GetProjectListResponse {
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

export class GetUserResponse {
	/*
	 * The name of the user.
	 */
	email: string;

	/*
	 * The GUID of the user.
	 */
	guid: string;
}

export class GetProjectResponse {
	/*
	 * Name of the project.
	 */
	name: string;

	/*
	 * The owner's user GUID of the project.
	 */
	owner: string;

	/*
	 * The user GUIDs of the project.
	 */
	members: string[];
}

export class GetInvitationResponse {
	/*
	 * The GUID of the project that the invite is for.
	 */
	project_guid: string;

	/*
	 * The name of the project that the invite is for.
	 */
	project_name: string;

	/*
	 * The owner's user GUID of the project that the invite is for.
	 */
	owner_guid: string;

	/*
	 * The owner's email of the project that the invite is for.
	 */
	owner_email: string;
}
