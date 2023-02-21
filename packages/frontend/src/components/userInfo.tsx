import './userInfo.css';
import Button from '@mui/material/Button';
import avatar from './sad-chair.jpg';

import { ApiError } from '../proflow';
import {useState} from 'react';
import './Project.tsx';
import Project from './Project';
import React from 'react';
import { AppState } from '../App';
import { SpaceBar } from '@mui/icons-material';

export interface UserData {
    // add an image to the interface to the user from API
    // avatar?: undefined;

    // name
    name: string;

    // information
    description: string;

    // project Info
    state : AppState;
}

const updateProjects = (projects : string[]) => {
    let projectList : any[] = [];
    projects.forEach((name) => {
        projectList.push(
            <Project name={name}></Project>
        );
    });
    return <>{projectList}</>;
    }

async function createProj(state : AppState, name: string) {
    console.log(state.is_authorized);
    try {
        const res = await state.client.project.projectCreate({name: name});
        console.log(res);
    } catch (e) {
        if (e instanceof ApiError) {
            console.log("Request failed (" + e.status + ") error: " + e.body.message);
        }
    }
}
 
export default function UserInfo(props: UserData) {
    const [projExp, setProjExp] = useState(true);
    const [following, setFollowing] = useState(false);
    const [contacts, setContacts] = useState(false);
    const [createName, setCreateName] = useState(false);
    const projects : string[] = [];

    return (
    <body className="body-of-page">
        <div className = "toppage">
            <div className = "main-user-info">
                <img alt="logo" src={avatar} className = "user-avatar-main"></img>
                <div className = "name-and-org">
                    <div className = "user-name-main">Name: {props.name}</div>
                </div>
                <div className = "user-description">{props.description}</div>
            </div>
            <div className = "buttons">
                <Button variant="outlined" sx={{color: "white", margin:2}} onClick={() => {
                    setFollowing(false); 
                    setProjExp(!projExp);
                    setContacts(false);
                }}>Projects</Button>
                <Button variant="outlined" sx={{color: "white", margin:2}} onClick={() => {
                        setFollowing(!following); 
                        setProjExp(false);
                        setContacts(false);
                }}>Following</Button>
                <Button variant="outlined" sx={{color: "white", margin:2}} onClick={() => {
                    setFollowing(false);
                    setProjExp(false);
                    setContacts(!contacts);
                }}>Contact</Button>
            </div>
        </div>
            {
                projExp &&
                <div className ="involved-projects">
                    <>{updateProjects(projects)}</>
                    {
                    createName ? 
                    <div> 
                        <input id="projName" type="text"/> 
                        <Button variant="contained" size="small" onClick={() => setCreateName(false)}>
                            Cancel
                        </Button> 
                        <Button variant="contained" size="small" onClick={() => {
                            const new_name = (document.getElementById('projName') as HTMLInputElement).value;
                            if (new_name.length !== 0) {
                                createProj(props.state, new_name);
                                setCreateName(false);
                            }
                        }}>
                            Submit
                        </Button>
                    </div> : 
                    <Button variant="contained" size="small" onClick={() => setCreateName(true)}>
                        Create New Project
                    </Button>
                    }
                    {/* <Project name="ProFlow"></Project>
                    <Project name="ProFlow"></Project>
                    <Project name="ProFlow"></Project>
                    <Project name="ProFlow"></Project> */}
                </div>
            }
            {
                following &&
                <div className ="involved-projects">
                    <Project name="ProFlow2"></Project>
                    <Project name="Google"></Project>
                </div>
            }
            {
                contacts &&
                <div className ="involved-projects">
                    <Project name="Email"></Project>
                </div>
            }
    </body>
    );
}