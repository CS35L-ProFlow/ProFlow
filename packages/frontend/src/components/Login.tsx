import React, { useState } from 'react';
import Button from '@mui/material/Button'
import TextField from "@mui/material/TextField"
import { AppState } from "../App"
import { ApiError } from "../proflow/core/ApiError";
import "./Login.css"

export interface LoginProps {
	state: AppState,
}

export default function Login(props: LoginProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<body>
			<div className="container">
				<h1>
					Login
				</h1>
				<div className="input-group">
					<TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
				</div>
				<div className="input-group">
					<TextField type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
				</div>
				<Button variant="contained" onClick={async () => {
					try {
						const res = await props.state.client.auth.authLogin({ email, password });
						props.state.authorize(res.jwt, res.expire_sec);
					} catch (e) {
						if (e instanceof ApiError) {
							console.log("Request failed (" + e.status + ") error: " + e.body.message);
						}
					}
				}}>Login</Button>
			</div>
		</body>
	);
}
