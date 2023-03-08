import React from 'react';
import './index.css';


import { Button, TextField, Box, Badge, CircularProgress, Typography, Alert, } from '@mui/material/';

import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import InviteCard from './InviteCard'; //TODO: Make Invite cards / page look nice
import { Session, Project, Invite, init_proflow_client } from '../../client';
import { useNavigate } from "react-router-dom";
import { ProFlow } from '../../proflow';
import Pages from "../../pages";

export interface UserViewProps {
	session?: Session;
	onRefresh: (session: Session) => void,
}

export default function UserView(props: UserViewProps) {

	const [projects, setProjects] = useState<Project[] | undefined>(undefined);
	const [inInvites, setInInvites] = useState<Invite[] | undefined>(undefined);
	const [createProj, setCreateProj] = useState(false);
	const [deleteProj, setDeleteProj] = useState(false);
	const [projDisp, setProjDisp] = useState(true);
	const [inInviteDisp, setInInviteDisp] = useState(false);
	const [inviteAccepted, setInviteAccepted] = useState(false);
	const [taken, setTaken] = useState(false);

	const [fetchError, setFetchError] = useState(false);

	const [display, setDisplay] = useState(false);
	const [progress, setProgress] = useState(false);
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
		// alert("AAA");
		const fetch = () => {
			fetchProjects();
			fetchInvites();
		}
		
		const fetchProjects = async () => {
			if (!props.session){
				return;
			}
			setProgress(true);
			const res = await props.session.get_my_projects();
			if (res.err) {
				setFetchError(true);
				console.log(res.val);
				return;
			}
			setProgress(false);

			setProjects(res.val);
			setDeleteProj(false);
			setFetchError(false);
		}

		const fetchInvites = async () => {
			if (!props.session){
				return;
			}
			setProgress(true);
			const res = await props.session.get_my_invites();
			if (res.err) {
				setFetchError(true);
				console.log(res.val);
				return;
			}
			setProgress(false);
			setInInvites(res.val);
			setInviteAccepted(false);
			setFetchError(false);
		}

		if (!props.session) {

			const refreshJwt = async (client: ProFlow, jwt: string) => {
				try {
					const res = await client.auth.authRefresh();
					const user_guid = res.user_guid;
					const expire_sec = res.expire_sec;
					const queryRes = await client.user.queryUser(user_guid);
					const user_email = queryRes.email;
					props.onRefresh(new Session(user_email, user_guid, jwt, expire_sec));
				} catch (e) {
					console.log("Failed to refresh JWT token");
					navigate(Pages.LOGIN);
				}
			}

			const jwt = localStorage.getItem("jwt");
			if (!jwt) {
				navigate(Pages.LOGIN);
				return;
			}
			const client = init_proflow_client(jwt);
			refreshJwt(client, jwt);

		}
		fetch();
	}, [projDisp, inInviteDisp, display])

	if (!props.session) {
		return <body></body>;
	}


	const projectComponents = () => {
		if (!projects){
			return <CircularProgress color='success' />
		}
		if (projects.length === 0){
			return <Alert variant="outlined" severity="info" sx={{ margin: 2, maxWidth: "100%", textAlign: "left" }}>No Projects Found. Press "NEW PROJECT" to create a new one</Alert>;
		}
		return projects.map(proj => {
			return <ProjectCard key={proj.guid} guid={proj.guid} name={proj.name} session={props.session!} owner={proj.owner} onDelete={async () => {
				if (!props.session || !proj.guid){
					return;
				}
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
		if (!inInvites){
			return <CircularProgress />;
		}

		if (inInvites.length === 0){
			return <Alert variant="outlined" severity="info" sx={{ margin: 2, maxWidth: "100%" }}>No Invites found</Alert>;
		}
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
			}} name={invite.project_name} owner={invite.owner.email} />
		});
	}

	return (
		<div className="body-of-page">
			<div className="name-and-org">
				{/* <div className="user-name-main">Name: {props.session.email}</div> */}
				<Typography sx={{ margin: 3, marginLeft:6 }} fontSize={"large"} variant='overline'>{props.session.email}</Typography>
			</div>
			<hr></hr>
			{/* <div className="user-description">{props.description}</div> */}

			<div className='buttons'>
				<Button variant="contained" sx={{ color: "white", margin: 1, maxWidth: "100%" }} onClick={() => {
					setInInviteDisp(false)
					setProjDisp(true);
					// setContacts(false);
				}}>Your Projects</Button>
				<Badge badgeContent={inInvites?.length ?? 0} color="secondary" sx={{ margin: 1 }}>
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
				{/* }}>Outprgoing Invites</Button> */}
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
											onKeyDown={e => {if(e.key === "Enter") {
												e.preventDefault();
												const submitBtn = document.getElementById("submit-button");
												if(submitBtn){
													submitBtn.click();
												}
											}}}
										/>
									</div>
									</Box>
								<div className="buttons2"> 
									<Button id="submit-button" variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={async () => { 
									const name = (document.getElementById('outlined-required') as HTMLInputElement).value; 
									if (name.length !== 0 && props.session) { 
										

										if (projects && projects.some(proj => proj.name === name)) { 
											setTaken(true);
											return;
										}
										await props.session.create_project(name);
										setCreateProj(false); 
										setTaken(false);
										setDisplay(!display);
									} 
									return;
									}}> 
										Submit 
									</Button> 
									<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={() => setCreateProj(false)}> 
										Cancel 
									</Button> 
								</div>
								{taken &&
								<Alert variant="outlined" severity="error" sx={{ marginLeft:1, maxWidth: "10%", textAlign: "left"}}>Project name is taken</Alert>
								}
							</div>  : 
							<Button variant="outlined" size="small" color="success" sx={{ color: "black", margin: 1, maxWidth: `100%` }} onClick={() => setCreateProj(true)}> 
								+ New Project
							</Button>
					}
				</div>
			}

			{
				inInviteDisp &&
				<div className="invite-cards">
					{incomingInviteComponents()}
				</div>
			}


		</div>
	);
}
