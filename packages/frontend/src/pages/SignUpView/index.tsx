import { Button, TextField, Alert } from "@mui/material"
import { useEffect, useState } from 'react';
import Client, { Session } from "../../client";
import { useNavigate } from "react-router-dom";
import Pages from "../../pages";
import '../../pages/LoginView/index.css';
import React from "react";

export interface SignUpProps {
	client: Client,
	onLogin: (session: Session) => void,
};


export function SignUp(props: SignUpProps) {
	const [email, setEmail] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [dispPasswordError, setPasswordError] = useState(false);
	const navigate = useNavigate();
	const [ErrorPassword, AlterPasswordError] = useState<string | undefined>(undefined);
	const[ErrorEmail, AlterEmailError] = useState<string | undefined>(undefined);
	const [PasswordStatus, AlterPasswordStatus] = useState<string | undefined>(undefined);

	function updateEmail(newEmail: string) 
	{
		AlterEmailError("");
		setEmail(newEmail);
		console.log(newEmail);
	}

	function updatePassword1(newPassword1: string)
	{
		setPassword1(newPassword1);
		if (password2.length !== 0) {
			if (newPassword1 != password2) {
				AlterPasswordError("Uh oh, your passwords don't match");
				setPasswordError(true);
			}
			else {
				setPasswordError(false);
				AlterPasswordStatus("Passwords match");
			}
		}
		else {
			setPasswordError(false);
			AlterPasswordStatus(undefined);
		}
	}

	function updatePassword2(newPassword2: string)
	{
		setPassword2(newPassword2);
		if (newPassword2.length !== 0) {
			if (password1 != newPassword2) {
				AlterPasswordError("Uh oh, your passwords don't match");
				setPasswordError(true);
			}
			else {
				setPasswordError(false);
				AlterPasswordStatus("Passwords match");
			}
		}
		else {
			setPasswordError(false);
			AlterPasswordStatus(undefined);
		}
	}

	async function signup() 
	{
		if (password2.length === 0) {
			setPasswordError(true);
			AlterPasswordError("Password required");
			return;
		}
		if (password1 !== password2) {
			updatePassword2(password2);
			return;
		}
		const response = await props.client.signUp(email, password2);
		if (response.ok) {
			props.onLogin(response.val);
			navigate(Pages.USER);
		}
		else {
			AlterEmailError(response.val);
		}
	}

	function handleEnter(event: React.KeyboardEvent<HTMLButtonElement>): void {
		if (event.key === 'Enter') {
		  signup();
		}
	  }

	return (
		<div>
		<div className="container1">
			<h1>
				Welcome, Let's Get Started
			</h1>
			<div className="input-group">
				<TextField label="Enter your Email" value={email} error={!!ErrorEmail} 
					onKeyDown={e => {if(e.key === "Enter") {signup()}}}
					helperText={ErrorEmail} onChange={e => updateEmail(e.target.value)} />
			</div>
			<div className="input-group">
				<TextField type="Password" label="Password" id="password" 
					error={dispPasswordError} value={password1} 
					onKeyDown={e => {if(e.key === "Enter") {signup()}}}
					onChange={e => updatePassword1(e.target.value)} />
			</div>
			<div className="input-group">
				<TextField type="Password" label="Confirm password" value={password2} 
					error={dispPasswordError} 
					helperText={dispPasswordError ? ErrorPassword : PasswordStatus} 
					onKeyDown={e => {if(e.key === "Enter") {signup()}}}
					onChange={e => updatePassword2(e.target.value)}/>
			</div>
			<div className="fixError">
			<Button className="clickMe" id="LOGIN" variant="contained" 
				onKeyDown={handleEnter} onClick={signup} >Sign Up!</Button> 
			</div>
		</div>
<<<<<<< HEAD
		<div className="alternative">
		<p className="promptAlt">Already have an account?
		<p>   </p>
		<a className="altLink" href={"http://localhost:3000/login"}>{"Login"}</a>
		</p>
		</div>
    </div>
    //Old sign up code, just leaving this here as a reference
		// <div>
		// 	<h1>Welcome!</h1>
		// 	<h2>Enter your new account information below:</h2>
		// 	<div>Email:</div>
		// 	<input id="email" type="text" />
		// 	<div>Password</div>
		// 	<input id="password" type="text" />
		// 	<div />
		// 	<br />
		// 	<Button variant="contained" size="small" onClick={async () => {
		// 		const email_input = (document.getElementById('email') as HTMLInputElement).value;
		// 		const password = (document.getElementById('password') as HTMLInputElement).value;
		// 		// try {
		// 		// 	const res = await props.client.http.auth.authSignup({ email: email_input, password: password });
		// 		// 	props.client.authorize(res.jwt, res.expire_sec);
		// 		// 	navigate(Pages.USER);
		// 		// } catch (e) {
		// 		// 	if (e instanceof ApiError) {
		// 		// 		console.log("Request failed (" + e.status + ") error: " + e.body.message);
		// 		// 	}
		// 		// }
		// 	}}>Sign Up!</Button>
		// 	<br />
		// 	<Button variant="contained" size="small" onClick={() => window.open("https://google.com")}>Invite Friends</Button>
		// </div>
=======
>>>>>>> 216d035802496704d7aa28b3b514577ae430ce12
	);
}
