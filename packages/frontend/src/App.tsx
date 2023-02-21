import React, { useState } from 'react';
import { ProFlow } from "./proflow/ProFlow";
import './MainPage.css';
import { Column, Profile, NoteCard, closeAddNotesIcon, addNotes, PopupBox } from './MainPage'; 
import { SignUp } from "./SignUp";
import { ApiError } from './proflow/core/ApiError';
import { MainPage } from './MainPage';
import Project from './components/Project';
import { DummyLogin } from './dummyLogin';
import UserInfo from './components/userInfo';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate
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
		// const res = await this.client.auth.authRefresh();
		// this.jwt = res.jwt;
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

export enum PAGES {
	main='/',
	user="/user",
	signUp="/signup",
	login="/login",
}


const App = () => {
	let state = new AppState();
	const [userString,setUserString]=useState("");
	return (
		<Router>
			<Routes>
				<Route path={PAGES.main} element={<MainPage state={state}/>}/>
				<Route path={PAGES.signUp} element={<SignUp state={state} endUser={(user : string) => setUserString(user)}/>}/>
				<Route path={PAGES.user} element={<UserInfo name={userString} description="test" state={state}/>}/>
				<Route path={PAGES.login} element={<DummyLogin state={state} endUser={(user : string) => setUserString(user)}/>}/>
			</Routes>
		</Router>
	  )
}

export default App;
