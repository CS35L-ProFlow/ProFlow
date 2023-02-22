import { useState } from 'react';
import Button from '@mui/material/Button'
import TextField from "@mui/material/TextField"
import Client, { Session } from "../../client"
import "./index.css"
import Pages from "../../pages";
import { useNavigate } from "react-router-dom";

export interface LoginProps {
	client: Client,

	onLogin: (session: Session) => void,
}

export default function Login(props: LoginProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	return (
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
				const res = await props.client.login(email, password);
				if (res.ok) {
					props.onLogin(res.val);

					navigate(Pages.USER);
					return;
				}

				// TODO: Show some error message to the user here!
				console.log(res.val);
			}}>Login</Button>
		</div>
	);
}
