import { Button } from "@mui/material"
import Client, { Session } from "./client";
import { useNavigate } from "react-router-dom";
import Pages from "./pages";
// import {AuthService} from "../../backend/src/auth/auth.service"

export interface SignUpProps {
	client: Client,

	onSignUp: (session: Session) => void;
};

export function SignUp(props: SignUpProps) {
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
				const email = (document.getElementById('email') as HTMLInputElement).value;
				const password = (document.getElementById('password') as HTMLInputElement).value;
				const res = await props.client.signUp(email, password);
				if (res.ok) {
					props.onSignUp(res.val);

					navigate(Pages.USER);
					return;
				}
				// TODO: Show some error message to the user here!
				console.log(res.val);
			}}>Sign Up!</Button>
			<br />
			<Button variant="contained" size="small" onClick={() => window.open("https://google.com")}>Invite Friends</Button>
		</div>
	);
}
