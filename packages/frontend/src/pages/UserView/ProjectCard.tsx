import './ProjectCard.css';
import React from 'react';
import Button from '@mui/material/Button';
// import {useState} from 'react';

export interface ProjectCardProps {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// name
	name: string | void;

	// role ?: string;

	// information
	// description: string;
}

export default function ProjectCard(props: ProjectCardProps) {
	let label: string;
	if (typeof props.name === "undefined") {
		label = "error";
	}
	else {
		label = props.name;
	}
	return (
		<div className="project-card">
			<div id="name-role">
				<p>{label}</p>
				{/* {props.role && <h3>Role: {props.role}</h3>} */}
			</div>
			<Button className="view-proj-b" variant="outlined" size="small" sx={{ color: "white", margin: "4px" }} /* onClick={()=>navigate("/project")} */>View</Button>
		</div>
	);
}
