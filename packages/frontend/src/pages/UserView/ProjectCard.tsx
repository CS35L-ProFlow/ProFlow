import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import Pages from '..';
import { Button } from '@mui/material';
// import Button from '@mui/material/Button';
// import {useState} from 'react';

export interface ProjectCardProps {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// name
	name: string | void;
	guid: string | void;
	setGuid: any;

	// role ?: string;

	// information
	// description: string;
}

export default function ProjectCard(props: ProjectCardProps) {
	let label: string;
	const navigate = useNavigate();
	const guid = props.guid;
	if (typeof props.name === "undefined") {
		label = "error";
	}
	else {
		label = props.name;
	}
	return (
		<div className="project-card">
			<div id="name-role">
				<h1>{label}</h1>
				{/* <Button onClick={() => {
					props.setGuid(props.guid);
					navigate("/"+props.guid);
				}}>{label}</Button> */}
				{/* {props.role && <h3>Role: {props.role}</h3>} */}
			</div>
			<Button className="view-proj-b" variant="outlined" size="small" sx={{ color: "white", margin: "4px" }} onClick={() => {
					props.setGuid(props.guid);
					navigate("/"+props.guid);
				}} >View</Button>
		</div>
	);
}
