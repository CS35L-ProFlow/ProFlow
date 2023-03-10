import { Button, TextField, Alert } from "@mui/material"
import { useRef, useState } from 'react';
import Client from "../../client";
import { useNavigate } from "react-router-dom";
import Pages from "../../pages";
import '../../pages/LoginView/index.css';
import React from "react";
// import {AuthService} from "../../backend/src/auth/auth.service"

export interface SignUpProps {
	client: Client,
};



//SOME NOTES:
/*
Okay so as of right now we have no functionality here, I just made the pages look sexy
Feel free to add logic here
Also, just a preference, it would be nice if it used the same sort of state variables and like if the functionality was placed into a function
For an example, you can look at the login page
again, this is just a preference, feel free to do as you please!
--Zack :)
*/

export function SignUp(props: SignUpProps) {
	const [email, setEmail] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [checkSuccess, setCheckSuccess] = useState(false);
	const navigate = useNavigate();
	const [errorLOL, errorChange] = useState(false);
	const[ErrorString, AlterString] = useState<string | undefined>(undefined);

	const handleChange = () =>{
		if (password1 === password2) {
			setCheckSuccess(false);
		} else {
			setCheckSuccess(true);
		}
	}
	return (
		<div>
		<div className="container1">
			<h1>
				Welcome, Let's Get Started
			</h1>
			<div className="input-group">
				<TextField label="Enter your Email" value={email} error={errorLOL} helperText={ErrorString} onChange={e => setEmail(e.target.value)} />
			</div>
			<div className="input-group">
				<TextField type="Password" label="Password" value={password1} onChange={e => setPassword1(e.target.value)} />
			</div>
			<div className="input-group">
				<TextField type="Password" label="Confirm password" value={password2} onChange={e => setPassword2(e.target.value)}/>
			</div>
			{/* <Button id="LOGIN" variant="contained" onKeyDown={handleEnter} onClick={signUp}>Sign Up!</Button> */}
			<div className="fixError">
			<Button className="clickMe" id="LOGIN" variant="contained" onClick={handleChange} >Sign Up!</Button> 
			</div>
			{
				checkSuccess && 
					<Alert severity="error" sx={{textAlign: "center", margin: "auto", width: "70%"}}>Uh oh, your passwords don't match </Alert>
			}
		</div>
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
	);
}
