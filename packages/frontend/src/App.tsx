import React, { useState } from 'react';
import { ProFlow } from "./proflow/ProFlow";
import { BACKEND_PORT } from "./env";
import './MainPage.css';
import { Column, Profile, NoteCard, closeAddNotesIcon, addNotes, PopupBox } from './MainPage'; 
import { SignUp } from "./SignUp";
import {Button} from "@mui/material"
import { ApiError } from './proflow/core/ApiError';
// import { deepStrictEqual } from 'assert';

export class AppState {
	private jwt?: string = undefined;

	get client() {
		return new ProFlow({
			BASE: "http://localhost:" + BACKEND_PORT,	// base URL for request is localhost + BACKEND_PORT / route
			HEADERS: this.jwt ? { "Authorization": "Bearer " + this.jwt } : undefined
		})
	};


	authorize(jwt: string, expire_sec: number) {
		this.jwt = jwt;
		this.refresh_auth(this.refresh_rate_ms(expire_sec));
	}

	private refresh_auth(timeout_ms: number) {
		console.log("Refreshing in " + timeout_ms + " ms...")
		setTimeout(async () => {
			try {
				const res = await this.client.auth.authRefresh();
				this.jwt = res.jwt;
				console.log("Refreshed auth token!");

				this.refresh_auth(this.refresh_rate_ms(res.expire_sec));
			} catch (e) {
				console.log("Failed to refresh JWT token, trying again...");
				this.refresh_auth(500);
			}
		}, timeout_ms)
	}

	private refresh_rate_ms = (secs: number) => Math.max((secs - 30) * 1000, 1000)

	get is_authorized() { return this.jwt != undefined; }
}

const App = () => {
	const state = new AppState();
	const login_email = "user@gmail.com";
	const login_password = "test";
	return (
	<body>
		<div className = "Main-Page">
			<nav>
				<img src="LOGO-HERE" className = "logo"></img>
				<ul>
					<li>
						<Button variant="contained" className = "Button-Design"onClick={async () => {
						try {
							const res = await state.client.auth.authSignup({ email: login_email, password: login_password });
							state.authorize(res.jwt, res.expire_sec);
						} catch (e) {
							if (e instanceof ApiError) {
								console.log("Request failed (" + e.status + ") error: " + e.body.message);
							}
						}
						console.log("hi")
						}}>Yo</Button>
					</li>

					<li>
						<Button variant="contained" onClick={async () => {
							const res = await state.client.auth.authLogin({ email: login_email, password: login_password });
							console.log("Logged in " + res.jwt)
							state.authorize(res.jwt, res.expire_sec);
						}}>Login</Button>
						
					</li>
					<li>
						<Button variant="contained" onClick={async () => {
							const res = await state.client.user.getUserProjects();
							console.log("Get projects " + res.project_guids)
						}}>Get Projects</Button>
					</li>


				</ul>
				<Profile UserName='[NAME HERE]'></Profile>

			</nav>
			<PopupBox></PopupBox>
		
			<div className = "wrapper">
				<Column title="Backing">
					<div>
						<NoteCard title="Title" description="description..." time="time"></NoteCard>
					</div>
				</Column>
				<Column title="Design"></Column>
				<Column title="To Do"></Column>
				<Column title="Doing"></Column>
		
			</div>
		</div>
	</body>
	
	);
}

export default App;

// export default SignUp;
