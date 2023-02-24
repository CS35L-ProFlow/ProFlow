import React from 'react';
import './index.css';


import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField"
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

import avatar from '../../resources/sad-chair.jpg';

import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import { Session, Project } from '../../client';
import { useNavigate } from "react-router-dom";
import Pages from "../../pages";

export interface UserViewProps {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// project Info
	session?: Session;
}


// async function createProj(client: Client, name: string, oldNames: string[], updateProjNames: any, updateProjGuids: any, projects: any, setProjects: any) {
// 	try {
// 		await client.http.project.projectCreate({ name: name });
// 		updateProjNames([...oldNames, name]);
// 		const projGuids = (await client.http.user.getUserProjects()).project_guids;
// 		updateProjGuids(projGuids);
// 		setProjects([...projects, <Project key={name} name={name} />])
// 	} catch (e) {
// 		if (e instanceof ApiError) {
// 			console.log("Request failed (" + e.status + ") error: " + e.body.message);
// 		}
// 		console.log("error");
// 	}
// }

export default function UserView(props: UserViewProps) {
	const [projects, setProjects] = useState<Project[] | undefined>(undefined);
	const [projExp, setProjExp] = useState(true);
	const [createName, setCreateName] = useState(true);

	const navigate = useNavigate();

	useEffect(() => {
		const fetchProjects = async () => {
			if (!props.session)
				return;

			const res = await props.session.get_my_projects();
			if (res.err) {
				// TODO: Show some error message to the user here!
				console.log(res.val);
				return;
			}

			setProjects(res.val);
		}

		if (!props.session) {
			navigate(Pages.LOGIN)
			return;
		}

		fetchProjects();
	}, [])


	if (!props.session) {
		return <body></body>;
	}


	const projectComponents = projects ? projects.map(proj => {
		return <ProjectCard key={proj.guid} name={proj.name} />
	}) : <></>;

	return (
		<body className="body-of-page">
			<div className="main-user-info">
				<Avatar alt="user-avatar" src={avatar} className="user-avatar-main"/>
				<div className="name-and-org">
					{/* <div className="user-name-main">Name: {props.session.email}</div> */}
					<TextField disabled label="User Name"
					defaultValue={props.session.email} 
					size="small" className="Name"></TextField>
				</div>
				{/* <div className="user-description">{props.description}</div> */}
			
				<div className="buttons">
					<Button variant="outlined" color="primary" sx={{ color: "blue", margin: 2 }} onClick={() => {
						// setFollowing(false); 
						setProjExp(!projExp); 
						// setContacts(false); 
					}}>Projects</Button>
					<Button variant="outlined" sx={{ color: "blue", margin: 2 }} onClick={() => { 
						// setFollowing(!following); 
						// setProjExp(false); 
						// setContacts(false); */}
					}}>Invites</Button>
				</div>

				{
					projExp && 
				<div className="main-user-info2">
					{projectComponents /* TODO: make this variable contain all the projects */ }
					<ProjectCard name="ProFlow"></ProjectCard>
					{ 
						createName ? 
							<div className="add-new-project"> 
								<Button variant="contained" size="small" onClick={() => setCreateName(false)}> 
									Cancel 
								</Button> 
								<Box
									component="form"
									sx={{
										'& .MuiTextField-root': { m: 1, width: '25ch' },
									}}
									noValidate
									autoComplete="off"
									>
									<div>
										<TextField
										required
										id="outlined-required"
										label="Project Name"
										defaultValue="Hello World"
										/>
									</div>
									</Box>
								<Button variant="contained" size="small" onClick={() => setCreateName(false)} /* TODO: dd new project to the group and exit the addition window} */>
									Submit 
								</Button> 
							</div> : 
							<Button id="create-new-b" variant="outlined" size="small" color="success" onClick={() => setCreateName(true)}> 
								+ New Project
							</Button>
					} 
				</div>
				}
			</div>
			{/* { */}
			{/* 	following && */}
			{/* 	<div className="involved-projects"> */}
			{/* 		<Project name="ProFlow2"></Project> */}
			{/* 		<Project name="Google"></Project> */}
			{/* 	</div> */}
			{/* } */}
			{/* { */}
			{/* 	contacts && */}
			{/* 	<div className="involved-projects"> */}
			{/* 		<Project name="Email"></Project> */}
			{/* 	</div> */}
			{/* } */}
		</body>
	);
}
