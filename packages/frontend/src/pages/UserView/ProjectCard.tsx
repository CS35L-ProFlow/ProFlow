import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import Pages from '..';
import { Button, Alert, TextField, AlertColor } from '@mui/material';
import {useState} from 'react';

import { Session, Project } from '../../client';

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
	const [success, setSuccess] = useState(false);
	const [severity, setSeverity] = useState<AlertColor | undefined>("error");
	const [severityMessage, setSeverityMessage] = useState("Failed to sent");
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
					setSuccess(false);
				}} >Invite a person</Button>
				{
					invite &&
					<div>
						<TextField
							required
							id="outlined-required-invite"
							label="Email"
							defaultValue=""
							sx = {{maxWidth: `100%`, margin: 3}}
							onFocus = {() => setSuccess(false)}
							/>
						<div className='submit-cancel'>
						<Button variant="outlined" type="submit" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
							const name = (document.getElementById('outlined-required-invite') as HTMLInputElement).value; 
							if (name.length >= 3) { 
								setInvite(false);
								setSuccess(true);
								setSeverity("success");
								setSeverityMessage("Invite sent");
							}
							else{
								setSuccess(true);
								setSeverity("error");
								setSeverityMessage("Failed to sent");
							}
						}} >Submit</Button>
						<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
								setInvite(false);
								setSuccess(false);
							}} >Cancel</Button>
						</div>
					</div>
				}
				{
					success &&
						<Alert severity={severity}>{severityMessage}</Alert>
				}
				</div>
			</div>
		</div>
	);
}
