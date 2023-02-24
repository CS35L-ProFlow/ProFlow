import React from 'react';
import './index.css';


import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField"
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import CircularProgress from '@mui/material/CircularProgress';

import avatar from '../../resources/sad-chair.jpg';

// TODO: import InviteCount from ... 

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
const InviteCount = 2;

export default function UserView(props: UserViewProps) {
	const [projects, setProjects] = useState<Project[] | undefined>(undefined);
	const [projExp, setProjExp] = useState(true);
	const [invExp, setInvExp] = useState(false);
	const [createName, setCreateName] = useState(false);
	const [inviteCount, setInviteCount] = useState(InviteCount); // useState({InviteCount})
	const [isLoading, setIsLoading] = useState(false);
	const [newProjectInput, setNewProjectInput] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const fetchProjects = async () => {
			setIsLoading(true);
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
		setIsLoading(false);
	}, [])

	if (!props.session) {
		return <body></body>;
	}


	const projectComponents = projects ? projects.map(proj => {
		return <ProjectCard key={proj.guid} name={proj.name} />
	}) : <></>;

	const projectComps = [<ProjectCard name="ProFlow"></ProjectCard>,
	<ProjectCard name="NOOO"></ProjectCard>,
	<ProjectCard name="YEiuhdfijshfdiushfEEH"></ProjectCard>]

	const projectInvites = [<ProjectCard name="UCLA"></ProjectCard>,
	<ProjectCard name="TEST"></ProjectCard>]

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
					<Button variant="outlined" color="primary" sx={{ color: "blue", margin: 2, active:{color:"red"} }} onClick={() => {
						// setFollowing(false); 
						setProjExp(!projExp); 
						setInvExp(false);
						setInviteCount(InviteCount);
						setCreateName(false);
						// setContacts(false); 
					}}>Active Projects</Button>
					<Button variant="outlined" sx={{ color: "blue", margin: 2 }} onClick={() => { 
						// setFollowing(!following); 
						setProjExp(false); 
						setInvExp(!invExp);
						// setContacts(false); */}
						setInviteCount(0);
					}}>
					<Badge badgeContent={inviteCount} color="primary">
					<MailIcon color="action"  />
					</Badge></Button>
				</div>

				{
				projExp && 
					<div className='projects-row'>
						{isLoading &&
						<CircularProgress sx={{margin:10}}/>
						}
						
							{projectComponents /* TODO: make this variable contain all the projects */ }
						
						{ 
							createName ? 
								<div style={{margin:5}}> 
									<Button className="new-button" variant="contained" size="small" onClick={() => setCreateName(false)}> 
										Cancel 
									</Button> 
									<Box
										component="form"
										sx={{
											'& .MuiTextField-root': { m: 1, width: '100%' },
										}}
										noValidate
										autoComplete="off"
										>
										<div>
											<TextField
											required
											id="outlined-required"
											label="Project Name"
											defaultValue=""
											sx={{
												'& .MuiTextField-root': { m: 3, width: '100%' },
											}}
											onChange={(event) =>setNewProjectInput(event.target.value)}
											/>
										</div>
										</Box>
									<Button className="new-button" variant="contained" size="small" onClick={() => {setCreateName(false); console.log(newProjectInput)}} /* TODO: dd new project to the group and exit the addition window} */>
										Submit 
									</Button> 
								</div> : 
								<Button id="create-new-b" variant="outlined" size="small" color="success" onClick={() => setCreateName(true)}> 
									+ New Project
								</Button>
								
						} 
					</div>
				}

				{
					invExp && 
					<div className='projects-row2'>
						{isLoading &&
						<CircularProgress sx={{margin:10}}/>
						}
						{projectInvites}
					</div>
				}
				
			</div>
		</body>
	);
}
