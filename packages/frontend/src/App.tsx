import React, { useState } from 'react';
import { ProFlow } from "./proflow/ProFlow";
import { BACKEND_PORT } from "./env";
import './MainPage.css';
import { MainPage } from "./MainPage";

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
	// Change this when testing!
	return <MainPage state={state}></MainPage>;
}

export default App;
