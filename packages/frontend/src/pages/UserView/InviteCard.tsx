import './ProjectCard.css';
import React from 'react';
import { Button } from '@mui/material';

export interface InviteCardProps {
	name: string;
	onAcceptInvitation: () => void;
	owner: string,
}

export default function InviteCard(props: InviteCardProps) {
	return (
		<div className="project-card">
			<div className="column">
				<div className="card">
					<h3>{props.name}</h3>
					<h4>{"From: " + props.owner}</h4>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={props.onAcceptInvitation}>Accept</Button>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} >Deny</Button>
				</div>
			</div>
		</div>
	);
}
