import { Button } from "@mui/material"
import { AppState } from "./App";
import { ApiError } from "./proflow/core/ApiError";
import { useNavigate } from "react-router-dom";
import { Pages } from "./App";
// import {AuthService} from "../../backend/src/auth/auth.service"

export interface SignUpProps {
	state: AppState,
	endUser: any,
};

export function SignUp(props: SignUpProps) {
	const endUser = props.endUser;
	const navigate = useNavigate();
	return (
		<div>
			<h1>Welcome!</h1>
			<h2>Enter your new account information below:</h2>
			<div>Email:</div>
			<input id="email" type="text" />
			<div>Password</div>
			<input id="password" type="text" />
			<div />
			<br />
			<Button variant="contained" size="small" onClick={async () => {
				const email_input = (document.getElementById('email') as HTMLInputElement).value;
				const password = (document.getElementById('password') as HTMLInputElement).value;
				try {
					const res = await props.state.client.auth.authSignup({ email: email_input, password: password });
					props.state.authorize(res.jwt, res.expire_sec);
					endUser(email_input);
					navigate(Pages.USER);
				} catch (e) {
					if (e instanceof ApiError) {
						console.log("Request failed (" + e.status + ") error: " + e.body.message);
					}
				}
			}}>Sign Up!</Button>
			<br />
			<Button variant="contained" size="small" onClick={() => window.open("https://google.com")}>Invite Friends</Button>
		</div>
	);
}