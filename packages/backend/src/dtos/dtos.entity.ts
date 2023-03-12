import { IsEmail, IsNotEmpty, IsInt, ValidateIf } from "class-validator";

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

export class CreateSubProjectRequest {
	/*
	 * Name of the sub-project.
	 */
	@IsNotEmpty()
	name: string;
}

export class AddCardRequest {
	/*
	 * The title of the card.
	 */
	@IsNotEmpty()
	title: string;

	/*
	 * The column GUID to add the card to.
	 */
	@IsNotEmpty()
	column: string;

	/*
	 * The description of the card.
	 */
	@IsNotEmpty()
	description: string;

	/*
	 * The user GUID that the card is assigned to.
	 */
	assignee?: string;
}

export class EditCardRequest {
	/*
	 * The GUID of the card.
	 */
	@IsNotEmpty()
	guid: string;

	/*
	 * The priority index of the card. 0 is the highest priority in the column.
	 */
	@IsInt()
	@ValidateIf(o => o.priority !== undefined)
	priority?: number;

	/*
	 * The title of the card.
	 */
	title?: string;

	/*
	 * The description of the card.
	 */
	description?: string;

	/*
	 * The user GUID that the card is assigned to.
	 */
	assignee?: string;

	/*
	 * The column GUID that the card belongs to.
	 */
	column?: string;
}

export class CreateProjectColumnRequest {
	/*
	 * Name of the column.
	 */
	@IsNotEmpty()
	name: string;
}

export class RenameProjectColumnRequest {
	/*
	 * New name of the column.
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

export class ProjectColumnResponse {
	/*
	 * The name of the column.
	 */
	name: string;

	/*
	 * The GUID of the column.
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

	/*
	 * The GUID of the project.
	 */
	guid: string;

	/*
	 * The columns in the project. These are in order.
	 */
	columns: ProjectColumnResponse[]
}

export class SubProjectResponse {
	/*
	 * The name of the sub-project
	 */
	name: string;

	/*
	 * The GUID of the sub-project
	 */
	guid: string;

	/*
	 * The parent sub-project GUID, if there is one.
	 */
	parent_guid?: string;

	/*
	 * The child sub-projects.
	 */
	children: SubProjectResponse[]

	/*
	 * The root project GUID.
	 */
	project: string;
}

export class GetProjectTreeResponse {
	/*
	 * Name of the project
	 */
	name: string;

	/*
	 * The owner's user GUID of the project.
	 */
	owner: string;

	/*
	 * The GUID of the project.
	 */
	guid: string;

	/*
	 * The sub-projects.
	 */
	sub_projects: SubProjectResponse[];
}

export class CardResponse {
	/*
	 * The GUID of the card.
	 */
	guid: string;

	/*
	 * The title of the card.
	 */
	title: string;

	/*
	 * The description of the card.
	 */
	description: string;

	/*
	 * The user GUID that the card is assigned to.
	 */
	assignee?: string;

	/*
	 * The project GUID that the card belongs to
	 */
	project_guid: string;

	/*
	 * The sub-project GUID that the card belongs to
	 */
	sub_project_guid: string;

	/*
	 * The priority index of the card in the column.
	 */
	priority: number;

	/*
	 * The date the card was created.
	 */
	date_created: Date;

	/*
	 * The date the card was last modified.
	 */
	date_modified: Date;
}

export class GetColumnCardsResponse {
	/*
	 * The column GUID that the cards belong to.
	 */
	column: string;

	/*
	 * The name of the column
	 */
	column_name: string;

	/*
	 * The cards that are in the column
	 */
	cards: CardResponse[];
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

	/*
	 * Guid of project returned
	 */
	guid: string;
}

