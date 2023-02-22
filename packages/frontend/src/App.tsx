import React, { useState } from 'react';
import { ProFlow } from "./proflow/ProFlow";
import { SignUp } from "./SignUp";
import { ProjectView } from './pages/ProjectView';
import { DummyLogin } from './dummyLogin';
import UserInfo from './components/UserInfo';
import {
	BrowserRouter as Router,
	Routes,
	Route,
} from 'react-router-dom';
import { BACKEND_PORT } from './env';

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
		console.log("Refreshing in " + timeout_ms + " ms...");
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

export enum Pages {
	MAIN = '/',
	USER = "/user",
	SIGNUP = "/signup",
	LOGIN = "/login",
}

const App = () => {
	const [state, _] = useState(new AppState());
	const [userString, setUserString] = useState("");
	let [projGuids, setProjGuids] = useState([""]);
	const [projNames, setProjNames] = useState([]);
	return (
		<Router>
			<Routes>
				<Route path={Pages.MAIN} element={<ProjectView state={state} />} />
				<Route path={Pages.SIGNUP} element={<SignUp state={state} endUser={(user: string) => setUserString(user)} />} />
				<Route path={Pages.USER} element={<UserInfo projNames={projNames} updateProjNames={setProjNames} name={userString} description="test" state={state} projGuids={projGuids} updateProjGuids={(guids: string[]) => setProjGuids(guids)} />} />
				<Route path={Pages.LOGIN} element={<DummyLogin state={state} updateProjGuids={(guids: string[]) => setProjGuids(guids)} updateProjNames={setProjNames} endUser={(user: string) => setUserString(user)} />} />
			</Routes>
		</Router>
	)
}

export default App;
