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
			<div className="column">
				<div className="card">
					<h3>{props.name}</h3>
					<Button className="view-proj-b" variant="outlined" size="small" sx={{ color: "black", margin: "4px" }} /* onClick={()=>navigate("/project")} */>View</Button>
				</div>
			</div>
		</div>
	);
}
