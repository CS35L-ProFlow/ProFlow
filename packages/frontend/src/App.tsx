import React, { useState } from 'react';
import Button from '@mui/material/Button'
import { ProFlow } from "./proflow/ProFlow";
import { ApiError } from "./proflow/core/ApiError";
import { BACKEND_PORT } from "./env";
import './MainPage.css';
import { Column, Profile, NoteCard, closeAddNotesIcon, addNotes, PopupBox, toggleSidePanel, SidePanel } from './MainPage'; 
import { deepStrictEqual } from 'assert';

class AppState {
	private jwt?: string = undefined;

	get client() {
		return new ProFlow({
			BASE: "http://localhost:" + BACKEND_PORT,
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
						}}>Signup</Button>
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
			<SidePanel ProjectTitle1='Project 1' ProjectTitle2='Project 2'></SidePanel>








		</div>
	</body>
	
	);
}

// export function toggleSidePanel(){
// 	let sidePanel = document.querySelector(".side-panel");
// 	let sidePanelOpen = document.querySelector(".side-panel-toggle")
// 	sidePanelOpen!.classList.toggle("side-panel-open")
// 	return sidePanel!.classList.toggle("open-side-panel")
	
// }

export default App;
