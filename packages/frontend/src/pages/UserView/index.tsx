import React from 'react';
import './index.css';


import {Button, TextField, Avatar , Box, Badge, CircularProgress, Typography, Alert, InputAdornment}  from '@mui/material/';
import AccountCircle from '@mui/icons-material/AccountCircle';

import avatar from '../../resources/sad-chair.jpg';

// TODO: import InviteCount from ... 

import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import InviteCard from './InviteCard'; //TODO: Make Invite cards / page look nice
import { Session, Project, Invite } from '../../client';
import { useNavigate } from "react-router-dom";
import Pages from "../../pages";

// TODO: Implement loading screen

export interface UserViewProps {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// project Info
	session?: Session;
	setGuid: any;
}

export default function UserView(props: UserViewProps) {
	let InviteCount = 12;

	const [projects, setProjects] = useState<Project[] | undefined>(undefined);
	const [inInvites, setInInvites] = useState<Invite[] | undefined>(undefined);
	const [createProj, setCreateProj] = useState(false);
	const [deleteProj, setDeleteProj] = useState(false);
	const [projDisp, setProjDisp] = useState(true);
	const [inInviteDisp, setInInviteDisp] = useState(false);
	const [inviteAccepted, setInviteAccepted] = useState(false);

	const [progress, setProgress] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		const fetchProjects = async () => {
			if (!props.session)
				return;

			
			setProgress(true);
			const res = await props.session.get_my_projects();
			if (res.err) {
				// TODO: Show some error message to the user here!
				console.log(res.val);
				return;
			}
			setProgress(false);

			setProjects(res.val);
			setDeleteProj(false);
		}

		const fetchInvites = async () => {
			if (!props.session)
				return;
				setProgress(true);
				const res = await props.session.get_my_invites();
				if (res.err) {
					// TODO: Sho some error message to the user here!
					console.log(res.val);
					return;
				}
				setProgress(false);
				setInInvites(res.val);
				setInviteAccepted(false);
		}

		if (!props.session) {
			navigate(Pages.LOGIN)
			return;
		}
		setProgress(true);
		fetchProjects();
		fetchInvites();
		setProgress(false);
	}, [createProj, deleteProj, inviteAccepted])

	if (!props.session) {
		return <body></body>;
	}


	const projectComponents = (projects && projects.length !== 0) ? projects.map(proj => {
		return <ProjectCard key={proj.guid} guid={proj.guid} name={proj.name} user={props.session ? props.session.email : "N\\A"} owner={proj.owner.email} setGuid={props.setGuid} session={props.session} recordDelete={setDeleteProj} />
	}) : <Alert variant="outlined" severity="info" sx={{margin:2, maxWidth: "100%", textAlign: "left"}}>No Projects Found. Press "NEW PROJECT" to create a new one</Alert>;
	const inInviteComponents = (inInvites && inInvites.length !== 0) ? inInvites.map(invite => {
		return <InviteCard key={invite.guid} updateAccept={setInviteAccepted} session={props.session} guid={invite.guid} name={invite.project_name} owner_email={invite.owner_email} />
	}) : <Alert variant="outlined" severity="info" sx={{margin:2}}>No Invites found</Alert>;

	return (
		<body className="body-of-page">
			
			<div className="main-user-info">
				<Avatar alt="user-avatar" src={avatar} className="user-avatar-main"/>
				<div className="name-and-org">
					{/* <div className="user-name-main">Name: {props.session.email}</div> */}
					<TextField disabled label="User Name"
					defaultValue={props.session.email}
					size="small" className="Name" inputProps={{min: 0, style: { textAlign: 'center' }, }}  sx={{ color: "white", margin: "auto", maxWidth: "100%" }}></TextField>
				</div>
				{/* <div className="user-description">{props.description}</div> */}
				<div className='buttons'>
					<Button variant="outlined" sx={{ color: "black", margin: 1, maxWidth: "100%" }} onClick={() => { 
						setInInviteDisp(false)
						setProjDisp(true); 
						// setContacts(false);
					}}>Your Projects</Button>
					<Badge badgeContent={InviteCount} color="secondary" sx={{margin:1 }}>
							<Button variant="outlined" sx={{ color: "black", maxWidth: "100%" }} onClick={() => { 
							setInInviteDisp(true);
							setProjDisp(false); 

							// setContacts(false); 
						}}>Incoming invites</Button>
					</Badge>
					<Button variant="outlined" sx={{ color: "black", margin: 1, maxWidth: "100%"}} onClick={() => { 
						setInInviteDisp(false);
						setProjDisp(false); 
						// setContacts(!contacts); 
					}}>Outgoing Invites</Button> 
				</div>
				{
					projDisp && 
				<div className="projects-main">
					{progress &&
						<CircularProgress/>}
					{projectComponents}
					{ 
						createProj ? 
							<div className="add-new-project"> 
								<Box
									component="form"
									sx={{
										'& .MuiTextField-root': { m: 1, width: '25ch' },
									}}
									noValidate
									autoComplete="off"
									id='projName'
									>
									<div>
										<TextField
										required
										id="outlined-required"
										label="Project Name"
										defaultValue=""
										sx = {{maxWidth: `100%`}}
										/>
									</div>
									</Box>
								<div className="buttons2"> 
									<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={async () => { 
									const name = (document.getElementById('outlined-required') as HTMLInputElement).value; 
									if (name.length !== 0 && props.session) { 
										// If project name already exists
										if (projects && projects.some(proj => proj.name === name)) { 
											// TODO: Display some error message to the user here
											console.log("ERROR: Unable to create project. Project name already exists")
											return;
										}
										await props.session.create_project(name);
										setCreateProj(false); 
									} 
									return;
									}}> 
										Submit 
									</Button> 
									<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={() => setCreateProj(false)}> 
										Cancel 
									</Button> 
								</div>
							</div>  : 
							<Button variant="outlined" size="small" color="success" sx={{ color: "black", margin: 1, maxWidth: `100%` }} onClick={() => setCreateProj(true)}> 
								+ New Project
							</Button>
					} 
				</div>
				}

				{
					inInviteDisp &&
					<div className="projects-main">	
						{inInviteComponents}
					</div>
					
				}
				
			</div>
			<div className="involved-projects">
			</div>
		</body>
	);
}
