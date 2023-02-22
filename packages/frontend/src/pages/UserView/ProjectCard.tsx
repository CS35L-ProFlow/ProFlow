import './ProjectCard.css';
import React from 'react';
// import Button from '@mui/material/Button';
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
				<h1>{label}</h1>
				{/* {props.role && <h3>Role: {props.role}</h3>} */}
			</div>
		</div>
	);
}
