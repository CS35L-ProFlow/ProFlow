import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import TextField from "@mui/material/TextField";
import Pages from '..';
import { Button } from '@mui/material';
// import Button from '@mui/material/Button';
import { useState } from 'react';
import { Session } from '../../client';

export interface InviteCardProps {
	// add an image to the interface to the user from API
	// avatar?: undefined;

	// name
	name?: string;
	guid: string;
	// setGuid: any;
	session?: Session;
	updateAccept: any;

	// project_guid : string,
	// project_name : string,
	// owner_guid : string,
	owner_email?: string,

	// information
	// description: string;
}

export default function InviteCard(props: InviteCardProps) {
	let name: string;
	let owner: string;
	const guid = props.guid;
	// const navigate = useNavigate();
	// const guid = props.guid;
	if (!props.name) {
		name = "error";
	}
	else {
		name = props.name;
	}
	if (!props.owner_email) {
		owner = "error";
	}
	else {
		owner = props.owner_email
	}
	return (
		<div className="project-card">
			<div className="column">
				<div className="card">
					<h3>{name}</h3>
					<h4>{"From: " + owner}</h4>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={async () => {
						if (name.length !== 0 && props.session) {
							await props.session.accept_invite(guid);
							// TODO: Error handling and display accept success
							console.log("Invite accepted!")
							props.updateAccept(true);
						}
					}}>Accept</Button>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} >Deny</Button>
				</div>
			</div>
		</div>
	);
}
