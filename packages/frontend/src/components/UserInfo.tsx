import React from 'react';
import './UserInfo.css';
import Button from '@mui/material/Button';
import avatar from './sad-chair.jpg';

import { ApiError } from '../proflow';
import { useEffect, useState } from 'react';
import './Project.tsx';
import Project from './Project';
import { AppState } from '../App';

export interface UserData {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// name
	name: string;

	// information
	description: string;

	// project Info
	state: AppState;
	projGuids: string[];
	updateProjGuids: any;
	projNames: string[];
	updateProjNames: any;
}


async function createProj(state: AppState, name: string, oldNames: string[], updateProjNames: any, updateProjGuids: any, projects: any, setProjects: any) {
	try {
		await state.client.project.projectCreate({ name: name });
		updateProjNames([...oldNames, name]);
		const projGuids = (await state.client.user.getUserProjects()).project_guids;
		updateProjGuids(projGuids);
		setProjects([...projects, <Project key={name} name={name} />])
	} catch (e) {
		if (e instanceof ApiError) {
			console.log("Request failed (" + e.status + ") error: " + e.body.message);
		}
		console.log("error");
	}
}

export default function UserInfo(props: UserData) {
	const [projExp, setProjExp] = useState(true);
	const [following, setFollowing] = useState(false);
	const [contacts, setContacts] = useState(false);
	const [createName, setCreateName] = useState(false);
	const [projects, setProjects] = useState<any>([]);
	useEffect(() => {
		let curProjs = props.projNames.map((name) => {
			return <Project key={name} name={name} />
		})
		setProjects(curProjs);
	}, [])
	return (
		<body className="body-of-page">
			<div className="toppage">
				<div className="main-user-info">
					<img alt="logo" src={avatar} className="user-avatar-main"></img>
					<div className="name-and-org">
						<div className="user-name-main">Name: {props.name}</div>
					</div>
					<div className="user-description">{props.description}</div>
				</div>
				<div className="buttons">
					<Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => {
						setFollowing(false);
						setProjExp(!projExp);
						setContacts(false);
					}}>Projects</Button>
					<Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => {
						setFollowing(!following);
						setProjExp(false);
						setContacts(false);
					}}>Following</Button>
					<Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => {
						setFollowing(false);
						setProjExp(false);
						setContacts(!contacts);
					}}>Contact</Button>
				</div>
			</div>
			{
				projExp &&
				<div className="involved-projects">
					<>{projects}</>
					{
						createName ?
							<div>
								<input id="projName" type="text" />
								<Button variant="contained" size="small" onClick={() => setCreateName(false)}>
									Cancel
								</Button>
								<Button variant="contained" size="small" onClick={async () => {
									const new_name = (document.getElementById('projName') as HTMLInputElement).value;
									console.log("hi");
									if (new_name.length !== 0) {
										console.log("there");
										createProj(props.state, new_name, props.projNames, props.updateProjNames, props.updateProjGuids, projects, setProjects);
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
				</div>
			}
			{
				following &&
				<div className="involved-projects">
					<Project name="ProFlow2"></Project>
					<Project name="Google"></Project>
				</div>
			}
			{
				contacts &&
				<div className="involved-projects">
					<Project name="Email"></Project>
				</div>
			}
		</body>
	);
}
