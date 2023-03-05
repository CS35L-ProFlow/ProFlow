import React from 'react';
import './index.css';


import { Button, TextField, Box, Badge, CircularProgress, Typography, Alert, } from '@mui/material/';

import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import InviteCard from './InviteCard'; //TODO: Make Invite cards / page look nice
import { Session, Project, Invite } from '../../client';
import { useNavigate } from "react-router-dom";
import Pages from "../../pages";

export interface UserViewProps {
	session?: Session;
}

export default function UserView(props: UserViewProps) {
	let InviteCount = 12;

	const [projects, setProjects] = useState<Project[] | undefined>(undefined);
	const [inInvites, setInInvites] = useState<Invite[] | undefined>(undefined);
	const [createProj, setCreateProj] = useState(false);
	// const [deleteProj, setDeleteProj] = useState(false);
	const [projDisp, setProjDisp] = useState(true);
	const [inInviteDisp, setInInviteDisp] = useState(false);
	// const [inviteAccepted, setInviteAccepted] = useState(false);

	const navigate = useNavigate();

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


	const fetchInvites = async () => {
		if (!props.session)
			return;
		const res = await props.session.get_my_invites();
		if (res.err) {
			// TODO: Show some error message to the user here!
			console.log(res.val);
			return;
		}
		setInInvites(res.val);
	}

	const fetch = () => {
		fetchProjects();
		fetchInvites();
	}

	useEffect(() => {

		if (!props.session) {
			navigate(Pages.LOGIN)
			return;
		}
		fetch();
	}, [projDisp, inInviteDisp])

	if (!props.session) {
		return <body></body>;
	}


	const projectComponents = () => {
		if (!projects)
			return <CircularProgress />
		if (projects.length === 0)
			return <Alert variant="outlined" severity="info" sx={{ margin: 2, maxWidth: "100%", textAlign: "left" }}>No Projects Found. Press "NEW PROJECT" to create a new one</Alert>;

		return projects.map(proj => {
			return <ProjectCard key={proj.guid} guid={proj.guid} name={proj.name} session={props.session!} owner={proj.owner} onDelete={async () => {
				if (!props.session || !proj.guid)
					return;

				const res = await props.session.delete_proj(proj.guid);
				if (res.err) {
					// TODO: Error handling and display accept success
					console.log("Failed to delete project: " + res.val);
					return;
				}
				fetch();
			}} />
		});
	}

	const incomingInviteComponents = () => {
		if (!inInvites)
			return <CircularProgress />;

		if (inInvites.length === 0)
			return <Alert variant="outlined" severity="info" sx={{ margin: 2 }}>No Invites found</Alert>;
		return inInvites.map(invite => {
			return <InviteCard key={invite.guid} onAcceptInvitation={async () => {
				if (!props.session)
					return;

				const res = await props.session.accept_invite(invite.guid);
				if (res.err) {
					// TODO: Error handling and display accept success
					console.log("Failed to accept invitation: " + res.val);
					return;
				}
				fetch();
			}} name={invite.project_name} owner={invite.owner_email} />
		});
	}

	return (
		<div className="body-of-page">
			<div className="name-and-org">
				{/* <div className="user-name-main">Name: {props.session.email}</div> */}
				<Typography sx={{ margin: 3 }} fontSize={"large"} variant='overline'>{props.session.email}</Typography>
			</div>
			<hr></hr>
			{/* <div className="user-description">{props.description}</div> */}

			<div className='buttons'>
				<Button variant="contained" sx={{ color: "white", margin: 1, maxWidth: "100%" }} onClick={() => {
					setInInviteDisp(false)
					setProjDisp(true);
					// setContacts(false);
				}}>Your Projects</Button>
				<Badge badgeContent={InviteCount} color="secondary" sx={{ margin: 1 }}>
					<Button variant="contained" sx={{ color: "white", maxWidth: "100%" }} onClick={() => {
						setInInviteDisp(true);
						setProjDisp(false);

						// setContacts(false); 
					}}>Incoming invites</Button>
				</Badge>
				{/* <Button variant="contained" sx={{ color: "white", margin: 1, maxWidth: "100%" }} onClick={() => { */}
				{/* 	setInInviteDisp(false); */}
				{/* 	setProjDisp(false); */}
				{/* 	// setContacts(!contacts);  */}
				{/* }}>Outgoing Invites</Button> */}
			</div>
			{
				projDisp &&
				<div className="projects-main">
					<div className="project-card-list" >
						{projectComponents()}
					</div>
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
											sx={{ maxWidth: `100%` }}
										/>
									</div>
								</Box>
								<div className="buttons2">
									<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={async () => {
										const name = (document.getElementById('outlined-required') as HTMLInputElement).value;
										if (name.length === 0 || !props.session)
											return;

										const res = await props.session.create_project(name);
										if (res.err) {
											// TODO: Show the user this error
											console.log("Failed to create project: " + res.val);
											return;
										}

										setCreateProj(false);
										fetch();
									}}>
										Submit
									</Button>
									<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={() => setCreateProj(false)}>
										Cancel
									</Button>
								</div>
							</div> :
							<Button variant="outlined" size="small" color="success" sx={{ color: "black", margin: 1, maxWidth: `100%` }} onClick={() => setCreateProj(true)}>
								+ New Project
							</Button>
					}
				</div>
			}

			{
				inInviteDisp &&
				<div className="projects-main">
					{incomingInviteComponents()}
				</div>
			}


		</div>
	);
}
