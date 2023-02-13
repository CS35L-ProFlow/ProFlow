import React from 'react';
import Button from '@mui/material/Button'
import { ProFlow } from "./proflow/ProFlow";
import { ApiError } from "./proflow/core/ApiError";
import { BACKEND_PORT } from "./env";

class AppState {
	jwt?: string = undefined;
}

const App = () => {
	const state = new AppState();
	const client = () => new ProFlow({
		BASE: "http://localhost:" + BACKEND_PORT,
		HEADERS: state.jwt ? { "Authorization": "Bearer " + state.jwt } : undefined
	});

	const login_email = "user@gmail.com";
	const login_password = "test";

	if (!state.jwt) {
		return (
			<>
				<Button variant="contained" onClick={async () => {
					try {
						const res = await client().auth.authSignup({ email: login_email, password: login_password });
						console.log("Signed up " + res.jwt)
						state.jwt = res.jwt;
					} catch (e) {
						if (e instanceof ApiError) {
							console.log("Request failed (" + e.status + ") error: " + e.body.message);
						}
					}
				}}>Signup</Button>

				<Button variant="contained" onClick={async () => {
					const res = await client().auth.authLogin({ email: login_email, password: login_password });
					console.log("Logged in " + res.jwt)
					state.jwt = res.jwt;
				}}>Login</Button>

				<Button variant="contained" onClick={async () => {
					const res = await client().auth.authRefresh();
					console.log("Refreshed " + res.jwt)
					state.jwt = res.jwt;
				}}>Refresh</Button>

				<Button variant="contained" onClick={async () => {
					const res = await client().user.getUserProjects();
					console.log("Get projects " + res.project_guids)
				}}>Get Projects</Button>
			</>
		);
	} else {
		return <div></div>
	}
}

export default App;
