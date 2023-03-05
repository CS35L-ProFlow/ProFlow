import './ProjectCard.css';
import React from 'react';
import { useNavigate } from 'react-router';
import { Button, Alert, TextField, AlertColor } from '@mui/material';
import { useState } from 'react';

import { User, Session } from '../../client';

import DeleteIcon from '@mui/icons-material/Delete';

export interface ProjectCardProps {
	name: string;
	guid: string;
	onDelete: () => void;
	owner: User;
	session: Session;
}

export default function ProjectCard(props: ProjectCardProps) {
	const navigate = useNavigate();
	const [invite, setInvite] = useState(false);
	const [success, setSuccess] = useState(false);
	const [severity, setSeverity] = useState<AlertColor | undefined>("error");
	const [severityMessage, setSeverityMessage] = useState("Failed to sent");

	const owns_project = props.owner.guid === props.session.guid;
	const owner = owns_project ? "Me" : props.owner.email;

	return (
		<div className="project-card">
			<div className="column">
				<div className="card">
					<h3>{props.name}</h3>
					<h4>{"Owner: " + owner}</h4>
					<hr></hr>
					<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
						navigate("/project/" + props.guid);
					}} >View</Button>
					{
						owns_project &&
						<Button variant="outlined" size="small" sx={{ color: "black", margin: 1 }} onClick={() => {
							setInvite(!invite);
							setSuccess(false);
							setInvite(true);
						}} >Send invite</Button>
					}
					{
						owns_project &&
						<Button variant="outlined" size="small" startIcon={<DeleteIcon sx={{ color: "black", margin: 1, maxWidth: "100%", textOverflow: "hidden" }} />}
							sx={{ color: "black", marginLeft: 6, maxWidth: "100%", textOverflow: "hidden" }}
							onClick={props.onDelete}>Delete</Button>
					}
					{
						invite &&
						<div>
							<TextField
								required
								id="required-invite"
								label="Email"
								defaultValue=""
								sx={{ maxWidth: `100%`, margin: 2 }}
							/>
							<div className='submit-cancel'>
								<Button variant="contained" type="submit" size="small" sx={{ color: "white", margin: 0.5 }} onClick={async () => {
									const invitee = (document.getElementById('required-invite') as HTMLInputElement).value;
									if (invitee.length === 0) {
										return; // TODO: check if the user exists
									}
									const res = await props.session.send_invite(invitee, props.guid);
									if (res.err) {
										setSuccess(true);
										setSeverity("error");
										setSeverityMessage(res.val);
										return;
									}

									setInvite(false);
									setSuccess(true);
									setSeverity("success");
									setSeverityMessage("Invite sent");
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
						<Alert sx={{ margin: 1 }} severity={severity}>{severityMessage}</Alert>
					}
				</div>
			</div>
		</div>
	);
}
