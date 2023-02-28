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
	setGuid: any;
}

export default function UserView(props: UserViewProps) {
	const [projects, setProjects] = useState<Project[] | undefined>(undefined);
	const [createName, setCreateName] = useState(true);
	const [projExp, setProjExp] = useState(true);
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
	}, [createName])

	if (!props.session) {
		return <body></body>;
	}


	const projectComponents = projects ? projects.map(proj => {
		return <ProjectCard key={proj.guid} guid={proj.guid} name={proj.name} setGuid={props.setGuid} />
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
					<Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => { 
					 	// setFollowing(false); 
						setProjExp(!projExp); 
					 	// setContacts(false);
					 }}>Projects</Button>
					<Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => { 
					 	// setFollowing(!following); 
					 	setProjExp(false); 
					 	// setContacts(false); 
					 }}>Invites</Button> 
					<Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => { 
					 	// setFollowing(false); 
					 	setProjExp(false); 
					 	// setContacts(!contacts); 
					 }}>Contact</Button> 
				</div>
				{
					projExp && 
				<div className="main-user-info2">
					{projectComponents /* TODO: make this variable contain all the projects */ }
					<ProjectCard name="ProFlow" guid="test" setGuid={() => {return 0}}></ProjectCard>
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
									id='projName'
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
								<Button variant="contained" size="small" onClick={async () => { 
				 				const name = (document.getElementById('outlined-required') as HTMLInputElement).value; 
				 				if (name.length !== 0) { 
									if (!props.session)
										return;
									await props.session.create_project(name);
				 					setCreateName(false); 
				 				} 
				 			}} /* TODO: dd new project to the group and exit the addition window} */>
									Submit 
								</Button> 
							</div> : 
							<Button id="create-new-b" variant="outlined" size="small" color="success" onClick={() => setCreateName(true)}> 
								+ New Project
							</Button>
					} 
				</div>
				}

				{/* {
					invExp && 
					<div className='projects-row2'>
						{isLoading &&
						<CircularProgress sx={{margin:10}}/>
						}
						{projectInvites}
					</div>
				} */}
				
			</div>
			{/* { */}
			{/* 	projExp && */}
			<div className="involved-projects">
			</div>
		</body>
	);
}
