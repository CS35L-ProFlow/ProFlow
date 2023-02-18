import React, { useState } from 'react';
import { ProFlow } from "./proflow/ProFlow";
import { BACKEND_PORT } from "./env";
import './MainPage.css';
import { MainPage } from "./MainPage";
import Button from '@mui/material/Button'
import './App.css';

export class AppState {
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
	return (
		<body>
		<div className="container">
			<h1>
				Login
			</h1>
			<div className="input-group">
				<div className ="email-and-label">
				<label className="label">Email address</label>
				<input name="Email" id="Email" className="input" type="email" />
				</div>
				<div></div>
			</div>
			<div className="input-group">
				<div className ="email-and-label2">
				<label className="label">Password</label>
				<input name="Email" id="Email" className="input" type="email" />
				</div>
				<div></div>
			</div>
		</div>
		</body>
	);
}

export default App;
