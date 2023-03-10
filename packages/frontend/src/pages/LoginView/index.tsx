import { useRef, useState } from 'react';
import Button from '@mui/material/Button'
import TextField from "@mui/material/TextField"
import Client, { Session } from "../../client"
import "./index.css";
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
	const [errorLOL, errorChange] = useState(false);
	const[ErrorString, AlterString] = useState<string | undefined>(undefined);
	

	async function login()
	{
		const res = await props.client.login(email, password);
				if (res.ok) {
					props.onLogin(res.val);

					navigate(Pages.USER);
					return;
				}
				else
				{
					errorChange(true);
					AlterString("Incorrect Username or Password");
				}

				console.log(res.val);
	}
	
	function handleEnter(event: React.KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === 'Enter') {
      login();
    }
  }

	return (
		<div>
		<div className="container1">
			<h1>
				Login
			</h1>
			<div className="input-group">
				<TextField label="Email" value={email} error={errorLOL} helperText={ErrorString} onChange={e => setEmail(e.target.value)} />
			</div>
			<div className="input-group">
				<TextField type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
			</div>
			{/* <Button id="LOGIN" variant="contained" onKeyDown={handleEnter} onClick={login}>Login</Button> */}
			<Button className="clickMe" id="LOGIN" variant="contained" onKeyDown={(event) => handleEnter(event)} onClick={(event) => login()}>Login</Button>
		</div>
		<div className="alternative">
		<p className="promptAlt">Don't have an account? 
		<p>   </p>
		<Button className="altLink" onClick={(event) => navigate(Pages.SIGNUP)}>{"Sign Up"}</Button>
		</p>
		</div>
		</div>
	);
}
