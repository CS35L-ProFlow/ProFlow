import {Button} from "@mui/material"
import { AppState } from "./App";
import { ApiError } from "./proflow/core/ApiError";
import { useNavigate } from "react-router-dom";
import { PAGES } from "./App";
import React from "react";
// import {AuthService} from "../../backend/src/auth/auth.service"

export interface dummyProps {
	state: AppState,
    endUser : any,
};

export function DummyLogin(props: dummyProps) {
    const endUser = props.endUser;
    const navigate = useNavigate();
    return(
        <div>
            <h1>Welcome!</h1>
            <h2>Sign in:</h2>
            <div>Email:</div>
            <input id="email" type="text"/>
            <div>Password</div>
            <input id="password" type="text" />
            <div/>
            <br />
            <Button variant="contained" size="small" onClick={async () => {
                const email_input = (document.getElementById('email') as HTMLInputElement).value;
                const password = (document.getElementById('password') as HTMLInputElement).value;
                try {
                    const res = await props.state.client.auth.authLogin({ email: email_input, password: password });
					props.state.authorize(res.jwt, res.expire_sec);
                    console.log(props.state.is_authorized);
                    endUser(email_input);
                    navigate(PAGES.user);
                } catch (e) {
                    if (e instanceof ApiError) {
                        console.log("Request failed (" + e.status + ") error: " + e.body.message);
                    }
                }
                }}>Sign In!</Button>
            <br />
			<Button variant="contained" size="small" onClick={() => window.open("https://google.com")}>Invite Friends</Button>
		</div>	
    );
}