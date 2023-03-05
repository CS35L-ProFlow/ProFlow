import { BACKEND_PORT } from '../env';
import { ProFlow, } from "../proflow/ProFlow";
import { ApiError } from "../proflow/core/ApiError";
import { Result, Ok, Err } from "ts-results";
import { GetProjectResponse } from '../proflow';

const init_proflow_client = (jwt?: string) => new ProFlow({
	// http://localhost:BACKEND_PORT/route
	BASE: "http://localhost:" + BACKEND_PORT,
	HEADERS: jwt ? { "Authorization": "Bearer " + jwt } : undefined
});

async function safe_request<T>(fn: () => Promise<T>): Promise<Result<T, string>> {
	try {
		const res = await fn();
		return Ok(res);
	} catch (e) {
		if (e instanceof ApiError) {
			return Err(e.body.message);
		} else {
			throw e;
		}
	}
}

export interface User {
	email: string,

	guid: string,
}

export interface Project {
	guid: string,

	name: string,

	owner: User,
}

export interface Invite {
	guid : string,
	project_guid : string,
	project_name : string,
	owner_guid : string,
	owner_email : string,
}

export class Session {
	private client: ProFlow;

	constructor(private user_email: string, private user_guid: string, jwt: string, expire_sec: number) {
		this.client = init_proflow_client(jwt);
		this.refresh_auth(this.refresh_rate_ms(expire_sec));
	}

	public get http() {
		return this.client;
	}

	public get guid() {
		return this.user_guid;
	}

	public get email() {
		return this.user_email;
	}

	public async query_user(guid: string): Promise<Result<User, string>> {
		return (
			await safe_request(async () => {
				return await this.get_user_throwable(guid);
			})
		).mapErr(err => "Failed to get user: " + err);
	}

	public async delete_proj(guid: string): Promise<Result<User, string>> {
		return (
			await safe_request(async () => {
				return await this.client.project.projectDelete(guid);
			})
		).mapErr(err => "Failed to get user: " + err);
	}

	public async create_project(name: string): Promise<Result<User, string>> {
		return (
			await safe_request(async () => {
				return await this.client.project.projectCreate({name});
			})
		).mapErr(err => "Failed to get user: " + err);
	}

	public async get_project_info(guid: string): Promise<Err<string>|Ok<GetProjectResponse>> {
		return (
			await safe_request(async () => {
				return await this.client.project.getProjectInfo(guid);
			})
		).mapErr(err => "Failed to get user: " + err);
	}

	public async get_my_projects(): Promise<Result<Project[], string>> {
		return (
			await safe_request(async () => {
				const res = await this.client.user.getUserProjects();
				const guids = res.project_guids;
				const promises = guids.map(guid => this.client.project.getProjectInfo(guid));

				const project_responses = await Promise.all(promises);

				return await Promise.all(project_responses.map(async (res): Promise<Project> => {
					return { guid: res.guid, name: res.name, owner: await this.get_user_throwable(res.owner) }
				}))
			})
		).mapErr(err => "Failed to get projects: " + err);
	}

	public async send_invite(invitee: string, guid: string): Promise<Result<User, string>> {
		return (
			await safe_request(async () => {
				return await this.client.project.projectInviteMember(invitee, guid);
			})
		).mapErr(err => "Failed to get user: " + err);
	}

	public async accept_invite(guid: string): Promise<Result<User, string>> {
		return (
			await safe_request(async () => {
				return await this.client.invite.projectAcceptInvitation(guid);
			})
		).mapErr(err => "Failed to get user: " + err);
	}

	public async get_my_invites(): Promise<Result<Invite[], string>> {
		return (
			await safe_request(async () => {
				const res = await this.client.user.getUserInvites();
				const guids = res.invite_guids;
				const promises = guids.map((guid) => this.client.invite.projectGetInvitation(guid));

				const invite_responses = await Promise.all(promises);

				return await Promise.all(invite_responses.map(async (res): Promise<Invite> => {
					return {guid: res.guid, project_name: res.project_name, project_guid: res.project_guid, owner_guid: res.owner_guid, owner_email: res.owner_email }
				}))
			})
		).mapErr(err => "Failed to get projects: " + err);
	}

	private async get_user_throwable(guid: string): Promise<User> {
		const { email } = await this.client.user.queryUser(guid);
		return { email, guid }
	}


	// TODO(Brandon): This is technically broken. If the session object is ever destroyed
	// or a new one is created, then this will end up being disasterous. In the final application
	// we will hopefully do something with refresh tokens stored server side to mitigate these issues.
	private refresh_auth(timeout_ms: number) {
		console.log("Refreshing in " + timeout_ms + " ms...");
		setTimeout(async () => {
			try {
				const res = await this.http.auth.authRefresh();
				this.client = init_proflow_client(res.jwt);
				console.log("Refreshed auth token!");

				this.refresh_auth(this.refresh_rate_ms(res.expire_sec));
			} catch (e) {
				console.log("Failed to refresh JWT token, trying again...");
				this.refresh_auth(500);
			}
		}, timeout_ms)
	}

	private refresh_rate_ms = (secs: number) => Math.max((secs - 30) * 1000, 1000)
}

export default class Client {
	public async login(email: string, password: string): Promise<Result<Session, string>> {
		const client = init_proflow_client();

		return (
			await safe_request(async () => {
				const res = await client.auth.authLogin({ email, password });
				return new Session(email, res.user_guid, res.jwt, res.expire_sec);
			})
		).mapErr(err => "Failed to log in: " + err);
	}

	public async signUp(email: string, password: string): Promise<Result<Session, string>> {
		const client = init_proflow_client();

		return (
			await safe_request(async () => {
				const res = await client.auth.authSignup({email, password})
				this.login(email, password)
				return new Session(email, res.user_guid, res.jwt, res.expire_sec);
			})
		).mapErr(err => "Failed to sign up: " + err)
	}
}

// try {
// 					const res = await props.client.http.auth.authSignup({ email: email_input, password: password });
// 					props.client.authorize(res.jwt, res.expire_sec);
// 					navigate(Pages.USER);
// 				} catch (e) {
// 					if (e instanceof ApiError) {
// 						console.log("Request failed (" + e.status + ") error: " + e.body.message);
// 					}
// 				}