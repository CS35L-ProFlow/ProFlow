import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import Pages from '..';
import { Button, Alert, TextField, AlertColor } from '@mui/material';
import {useState} from 'react';

import { Session, Project } from '../../client';

import DeleteIcon from '@mui/icons-material/Delete';

export interface ProjectCardProps {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// name
	name: string | void;
	guid: string | void;
	setGuid: any;
	session?: Session;
	recordDelete: any;
	owner: string;
	user: string;
	// role ?: string;

	// information
	// description: string;
}

export default function ProjectCard(props: ProjectCardProps) {
	let label: string;
	let owner: string;
	const navigate = useNavigate();
	const guid = props.guid;
	const [invite, setInvite] = useState(false);
	const [success, setSuccess] = useState(false);
	const [severity, setSeverity] = useState<AlertColor | undefined>("error");
	const [severityMessage, setSeverityMessage] = useState("Failed to sent");

	const[invitee, setInvitee] = useState("");

	if (props.owner == props.user) 
		owner = "me";
	else
		owner = props.owner;
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
					<h4>{"Owner: " + owner}</h4>
					<hr></hr>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1  }} onClick={() => {
					props.setGuid(props.guid);
					navigate("/"+props.guid);
				}} >View</Button>
				<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
					setInvite(!invite);
					setSuccess(false);
					setInvite(true);
				}} >Send invite</Button>
				{
					owner === "me" && 
					<Button variant="outlined" size="small" startIcon={<DeleteIcon sx={{ color: "black", margin: 1, maxWidth: "100%", textOverflow: "hidden" }} />} 
					sx={{ color: "black", marginLeft: 6, maxWidth: "100%", textOverflow: "hidden" }}
					onClick={async () => {
						if (!props.session || !props.guid){
							return;
						}
						await props.session.delete_proj(props.guid);
						props.recordDelete(true);
						return;
						}} >Delete</Button>
				}
				{
					invite &&
					<div>
						<TextField
							required
							id="required-invite"
							label="Email"
							defaultValue=""
							sx = {{maxWidth: `100%`, margin: 2}}
			
							onFocus = {() => setSuccess(false)}
							/>
						<div className='submit-cancel'>
						<Button variant="contained" type="submit" size="small" sx={{ color: "white", margin: 0.5 }} onClick = { async () => {
								if (!props.session || !guid) {
									setSuccess(true);
									setSeverity("error");
									setSeverityMessage("Failed to sent");
									return;
								}
								const invitee = (document.getElementById('required-invite') as HTMLInputElement).value; 
								if (invitee.length === 0) 
								{
									return; // TODO: check if the user exists
								}
								await props.session.send_invite(invitee, guid);
								setInvite(false);
								setInvite(false);
								setSuccess(true);
								setSeverity("success");
								setSeverityMessage("Invite sent");
								console.log("Invite Successful");
							}} > 
								Send
							</Button> 
						<Button variant="contained" size="small" sx={{ color: "white" }} onClick={() => {
								setInvite(false);
								setSuccess(false);
							}} >Cancel</Button>
						</div>
					</div>
				}
				{
					success &&
					<Alert sx={{margin: 1}} severity={severity}>{severityMessage}</Alert>
				}
				</div>
			</div>
		</div>
	);
}
