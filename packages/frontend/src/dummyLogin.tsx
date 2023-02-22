import {Button} from "@mui/material"
import { AppState } from "./App";
import { ApiError } from "./proflow/core/ApiError";
import { useNavigate } from "react-router-dom";
import { PAGES } from "./App";
import React from "react";
import { useState } from "react";
// import {AuthService} from "../../backend/src/auth/auth.service"

export interface dummyProps {
	state: AppState,
    endUser : any,
    updateProjGuids : any,
    updateProjNames : any,
};

const randomDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

const getIndName = async (guid : string, state : AppState) => {
    await randomDelay();
    const project = await state.client.project.getProjectInfo(guid);
    return project.name;
  };

const getNames = async (guids : string[], state : AppState, save : any) => {
    const unresolvedPromises = guids.map((guid) => getIndName(guid,state));
    const results = await Promise.all(unresolvedPromises);
    save(results);
}

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
                    const projects = await (await props.state.client.user.getUserProjects()).project_guids;
                    props.updateProjGuids(projects);
                    await getNames(projects, props.state, props.updateProjNames);
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