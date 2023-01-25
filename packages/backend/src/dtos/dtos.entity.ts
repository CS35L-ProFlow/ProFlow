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
	 * The user GUID is a string that is needed in order to perform requests that need authorization.
	 */
	guid: string;
}

