import React from 'react';
import './index.css';
import Button from '@mui/material/Button';
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
			<div className="toppage">
				<div className="main-user-info">
					<img alt="logo" src={avatar} className="user-avatar-main"></img>
					<div className="name-and-org">
						<div className="user-name-main">Name: {props.session.email}</div>
					</div>
					{/* <div className="user-description">{props.description}</div> */}
				</div>
				<div className="buttons">
					{/* <Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => { */}
					{/* 	// setFollowing(false); */}
					{/* 	// setProjExp(!projExp); */}
					{/* 	// setContacts(false); */}
					{/* }}>Projects</Button> */}
					{/* <Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => { */}
					{/* 	// setFollowing(!following); */}
					{/* 	// setProjExp(false); */}
					{/* 	// setContacts(false); */}
					{/* }}>Following</Button> */}
					{/* <Button variant="outlined" sx={{ color: "white", margin: 2 }} onClick={() => { */}
					{/* 	// setFollowing(false); */}
					{/* 	// setProjExp(false); */}
					{/* 	// setContacts(!contacts); */}
					{/* }}>Contact</Button> */}
				</div>
			</div>
			{/* { */}
			{/* 	projExp && */}
			<div className="involved-projects">
				{projectComponents}
				{/* { */}
				{/* 	createName ? */}
				{/* 		<div> */}
				{/* 			<input id="projName" type="text" /> */}
				{/* 			<Button variant="contained" size="small" onClick={() => setCreateName(false)}> */}
				{/* 				Cancel */}
				{/* 			</Button> */}
				{/* 			<Button variant="contained" size="small" onClick={async () => { */}
				{/* 				const new_name = (document.getElementById('projName') as HTMLInputElement).value; */}
				{/* 				if (new_name.length !== 0) { */}
				{/* 					// createProj(props.state, new_name, props.projNames, props.updateProjNames, props.updateProjGuids, projects, setProjects); */}
				{/* 					setCreateName(false); */}
				{/* 				} */}
				{/* 			}}> */}
				{/* 				Submit */}
				{/* 			</Button> */}
				{/* 		</div> : */}
				{/* 		<Button variant="contained" size="small" onClick={() => setCreateName(true)}> */}
				{/* 			Create New Project */}
				{/* 		</Button> */}
				{/* } */}
			</div>
			{/* } */}
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
