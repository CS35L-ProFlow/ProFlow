import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import TextField from "@mui/material/TextField";
import Pages from '..';
import { Button } from '@mui/material';
// import Button from '@mui/material/Button';
import {useState} from 'react';
import { Session } from '../../client';

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
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1  }} onClick={() => {
					props.setGuid(props.guid);
					navigate("/"+props.guid);
				}} >View</Button>
				<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
					setInvite(true);
				}} >Invite a person</Button>
				{
					owner === "me" && 
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={async () => {
						if (!props.session || !props.guid){
							return;
						}
						await props.session.delete_proj(props.guid);
						props.recordDelete(true);
						return;
					}} >Delete Project</Button>
				}
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
							<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick = { async () => {
								if (!props.session || !guid) {
									return;
								}
								const invitee = (document.getElementById('outlined-required') as HTMLInputElement).value; 
								if (invitee.length === 0) 
									return;
								await props.session.send_invite(invitee, guid);
								setInvite(false);
								// TODO: Display status of invite 
								console.log("Invite Successful");
							}} > 
								Send Invite! 
							</Button> 
							<Button variant="contained" size="small" sx={{ color: "white", margin: 1, maxWidth: `100%` }} onClick={() => setInvite(false)}> 
								Cancel 
							</Button> 
					</div>
				}
				</div>
			</div>
		</div>
	);
}
