import Button from '@mui/material/Button'
import Client, { Session } from "../../client"
import './index.css';
import Pages from "../../pages";
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { GetProjectResponse } from '../../proflow';

//This file contains the packground, drop down menu, and cards.

//New column
export interface ColumnProps {
	title: string;
	children?: React.ReactNode,
}

export function Column(props: ColumnProps) {
	return <li className="note">
		<div className="details">
			<p>{props.title}</p>
			<hr></hr>
		</div>
		{props.children}
		<div className="add-buttom">
			<Button id="add-note-button" onClick={addNotesButton}>Add new Notes</Button>
		</div>
	</li>;
}

//User Profile
export interface ProfileOptions {
	//User Name is probabily the only custmizable object here. 
	UserName: string;
	children?: React.ReactNode,

}
export function Profile(props: ProfileOptions) {
	return <div><img src="User-Image-Here" className="user-pic" onClick={toggleMenu}></img>
		<div className="drop-down-menu" id="subMenu">
			<div className="drop-down">
				<div className="user-profile">
					<img src='placehold.it/200x200' />
					<h2>{props.UserName}</h2>
				</div>
				<hr></hr>

				<a href='#' className="drop-down-link">
					<p>Switch accounts</p>
				</a>

				<a href='#' className="drop-down-link">
					<p>Manage Account</p>
				</a>

				<a href='#' className="drop-down-link">
					<p>Profile and visibility</p>
				</a>

				<a href='#' className="drop-down-link">
					<p>Settings</p>
				</a>
				<hr></hr>
				<a href='#' className="drop-down-link">
					<p>Can add other functionalities here</p>
				</a>
			</div>
		</div></div>
}

//Small Node Card
export interface NoteProps {
	title: string;
	description: string;
	time: string;
	children?: React.ReactNode,
}
export function NoteCard(props: NoteProps) {
	return <div className="note-card">
		<p>{props.title}</p>
		<span>{props.description}</span>
		<div className="bottom-content">
			<span>{props.time}</span>
			<div className='settings'>
				<i>Setting</i>
				<ul className="menu">
					<li>Edit</li>
					<li>Delete</li>
				</ul>
			</div>
		</div>
	</div>
}

//Popup Box:
export function PopupBox() {
	return <div className="popup-box">
		<div className="popup">
			<div className="content">
				<header>
					<p>Add a New Note</p>
					<i onClick={closeAddNotesIcon}>x</i>
				</header>
				<form action='#'>
					<div className="row">
						<label>Title</label>
						<input type="text"></input>
					</div>
					<div className="row description">
						<label>Description</label>
						<textarea></textarea>
					</div>
					<Button id="save-note-button" onClick={addNotes}>Add Note</Button>
				</form>
			</div>
		</div>
	</div>
}
export interface PanelProps{
    ProjectTitle1: string;
	ProjectTitle2: string;
	children?: React.ReactNode,
}

export function SidePanel(props:PanelProps){
	return 	<div className='side-wrapper'>
				<div className='side-panel'>
					<h2>
						Project
						<hr></hr>
						<Button>{props.ProjectTitle1}</Button>
						<Button>{props.ProjectTitle2}</Button>

					</h2>
				</div>
				<button className='side-panel-toggle' type='button' onClick={toggleSidePanel}>
					<span className="open">open</span>
					<span className="close">close</span>
				</button>

				<div className='main'>
					<div className = "wrapper">
						<Column title="Backing">
							<div>
								<NoteCard title="Title" description="description..." time="time"></NoteCard>
							</div>
						</Column>
						<Column title="Design"></Column>
						<Column title="To Do"></Column>
						<Column title="Doing"></Column>

					</div>
				</div>
			</div>
}
//Helper Functions Below:

//Show User Menu
export function toggleMenu() {
	let subMenu = document.getElementById("subMenu");
	return subMenu!.classList.toggle("open-menu");
}

//Show ADD NEW NOTES popup
const addBox = document.getElementById("add-note-button");
export function addNotesButton() {
	let popupBox = document.querySelector(".popup-box");
	return popupBox!.classList.add("show");
}

//Hide ADD NEW NOTES popup
export function closeAddNotesIcon() {
	let popupBox = document.querySelector(".popup-box");
	return popupBox!.classList.remove("show");
}
const notes = JSON.parse(localStorage.getItem("notes") || "[]")
//TODO: Show all the notes in localStorage
export function showNotes() {
	notes.forEach((note: string) => {
		//Add a card for each string stored in local memory.
		//addBox!.insertAdjacentHTML("afterend", divTag);
	});
}

//Add new notes
export function addNotes() {
	let addButton = document.getElementById("save-note-button")
	let titleTag = document.querySelector("input")
	let descriptionTag = document.querySelector("textarea")
	let noteTitle = titleTag?.value;
	let noteDescription = descriptionTag?.value;
	const monthArray = ["January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "December"];

	if (noteTitle || noteDescription) {
		let date = new Date();
		const day = date.getDate();
		const month = monthArray[date.getMonth()];
		const year = date.getFullYear();

		let noteInfo = {
			title: noteTitle,
			description: noteDescription,
			time: `${month} ${day} ${year}`
		}
		notes.push(noteInfo);
		localStorage.setItem("notes", JSON.stringify(notes));
		closeAddNotesIcon();
	}
}

//Toggle side panel
export function toggleSidePanel(){
	let sidePanel = document.querySelector(".side-panel");
	let sidePanelOpen = document.querySelector(".side-panel-toggle")
	sidePanelOpen!.classList.toggle("side-panel-open")
	return sidePanel!.classList.toggle("open-side-panel")
	
}

export interface ProjectViewProps {
	session: Session | undefined,
	guid: string | undefined;
};

export default function ProjectView(props: ProjectViewProps) {
	// const { guid } = useParams();
	const navigate = useNavigate();
	const [projInfo, setProjInfo] = useState<GetProjectResponse>();

	useEffect(() => {
		const fetchProjectInfo = async () => {
			if (!props.guid || !props.session)
				return;

			const res = await props.session.get_project_info(props.guid);
			if (res.err) {
				// TODO: Show some error message to the user here!
				console.log(res.val);
				return;
			}
			setProjInfo(res.val);
		}

		if (!props.session || !props.guid) {
			navigate(Pages.LOGIN)
			return;
		}

		fetchProjectInfo();
	}, [])
	const title = projInfo?.name;

	return (
		<body>
			<div className="Main-Page">
				<nav>
					<img src="LOGO-HERE" className="logo"></img>
					<h1>{title}</h1>
					<ul>
						<li>
							<Link to={Pages.SIGNUP}>
								<Button variant="contained" className="Button-Design">
									Signup
								</Button>
							</Link>
						</li>

						<li>
							{/* <Button variant="contained" onClick={async () => {
								const res = await state.client.auth.authLogin({ email: login_email, password: login_password });
								console.log("Logged in " + res.jwt)
								state.authorize(res.jwt, res.expire_sec);
							}}>Login</Button> */}
							<Link to={Pages.LOGIN}>
								<Button variant="contained" className="Button-Design">
									LOG IN
								</Button>
							</Link>

						</li>
						<li>
							<Button variant="contained" onClick={async () => {
								// const res = await props.client.http.user.getUserProjects();
								// console.log("Get projects " + res.project_guids)
							}}>Get Projects</Button>
						</li>


					</ul>
					<Profile UserName='[NAME HERE]'></Profile>

				</nav>
				<PopupBox></PopupBox>

				<div className="wrapper">
					<Column title="Backing">
						<div>
							<NoteCard title="Title" description="description..." time="time"></NoteCard>
						</div>
					</Column>
					<Column title="Design"></Column>
					<Column title="To Do"></Column>
					<Column title="Doing"></Column>

				</div>
			</div>
		</body>

	);
}
