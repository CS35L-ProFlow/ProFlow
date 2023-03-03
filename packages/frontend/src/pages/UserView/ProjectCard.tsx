import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import TextField from "@mui/material/TextField";
import Pages from '..';
import { Button } from '@mui/material';
// import Button from '@mui/material/Button';
import {useState} from 'react';

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
	const [invite, setInvite] = useState(false);
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
					<h3>{label}</h3>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1  }} onClick={() => {
					props.setGuid(props.guid);
					navigate("/"+props.guid);
				}} >View</Button>
				<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
					setInvite(!invite);
				}} >Invite a person</Button>
				{
					invite &&
					<div>
						<TextField
							required
							id="outlined-required"
							label="Email"
							defaultValue=""
							sx = {{maxWidth: `100%`, margin: 3}}
							/>
					</div>
				}
				</div>
			</div>
		</div>
	);
}
