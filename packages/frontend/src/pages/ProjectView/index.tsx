import { Button, TextField } from '@mui/material/'
import { Session, ProjectInfo, SubProject } from "../../client"
import './index.css';
import Pages from "../../pages";
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Result, Ok } from "ts-results";

//This file contains the packground, drop down menu, and cards.

//New column
interface ColumnProps {
	title: string;
	onOpenPopup: () => void;
	children?: React.ReactNode,
}

function Column(props: ColumnProps) {
	return <li className="note">
		<div className="details">
			<p>{props.title}</p>
			<hr></hr>
		</div>
		{props.children}
		<div className="add-buttom">
			<Button id="add-note-button" onClick={props.onOpenPopup}>Add new Notes</Button>
		</div>
	</li>;
}

//User Profile
interface ProfileOptions {
	//User Name is probabily the only custmizable object here. 
	UserName: string;
	children?: React.ReactNode,

}

function Profile(props: ProfileOptions) {
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
interface NoteProps {
	title: string;
	description: string;
	time: string;
	children?: React.ReactNode,
}

function NoteCard(props: NoteProps) {
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

interface PanelProps {
	ProjectTitle1: string;
	ProjectTitle2: string;
	children?: React.ReactNode,
}

function SidePanel(props: PanelProps) {
	return <div className='side-wrapper'>
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
			<div className="wrapper">
				{/* <Column title="Backing"> */}
				{/* 	<div> */}
				{/* 		<NoteCard title="Title" description="description..." time="time"></NoteCard> */}
				{/* 	</div> */}
				{/* </Column> */}
				{/* <Column title="Design"></Column> */}
				{/* <Column title="To Do"></Column> */}
				{/* <Column title="Doing"></Column> */}

			</div>
		</div>
	</div>
}
//Helper Functions Below:

//Show User Menu
function toggleMenu() {
	let subMenu = document.getElementById("subMenu");
	return subMenu!.classList.toggle("open-menu");
}

//Show ADD NEW NOTES popup
// function addNotesButton() {
// 	let popupBox = document.querySelector(".popup-box");
// 	return popupBox!.classList.add("show");
// }

//Hide ADD NEW NOTES popup
// function closeAddNotesIcon() {
// 	let popupBox = document.querySelector(".popup-box");
// 	return popupBox!.classList.remove("show");
// }

//Add new notes
// function addNotes(session: Session, guid: string) {
// 	let titleTag = document.querySelector("input")
// 	let descriptionTag = document.querySelector("textarea")
// 	let noteTitle = titleTag?.value;
// 	let noteDescription = descriptionTag?.value;

// 	if (noteTitle || noteDescription) {
// 		closeAddNotesIcon();
// 	}
// }

//Toggle side panel
function toggleSidePanel() {
	let sidePanel = document.querySelector(".side-panel");
	let sidePanelOpen = document.querySelector(".side-panel-toggle")
	sidePanelOpen!.classList.toggle("side-panel-open")
	return sidePanel!.classList.toggle("open-side-panel")

}

interface ProjectViewProps {
	session: Session | undefined,
};

export default function ProjectView(props: ProjectViewProps) {
	const { guid } = useParams();
	const navigate = useNavigate();
	const [projInfo, setProjInfo] = useState<ProjectInfo | undefined>(undefined);
	const [currentSubProject, setCurrentSubProject] = useState<SubProject | undefined>(undefined);

	const [newColumnName, setNewColumnName] = useState<string | undefined>(undefined);

	// TODO: Maybe group these state objects together since they're all related to creating a new card?
	const [currentColumnGuid, setCurrentColumnGuid] = useState<string | undefined>(undefined);
	const [newNoteTitle, setNewNoteTitle] = useState<string | undefined>(undefined);
	const [newNoteDescription, setNewNoteDescription] = useState<string | undefined>(undefined);

	// const [cards, setCards] = useState<Map<ColumnGuid, Card[]> | undefined>(undefined);

	const fetchProjectInfo = async () => {
		if (!guid || !props.session)
			return;

		const res = await props.session.get_project_info(guid);
		if (res.err) {
			// TODO: Show some error message to the user here!
			console.log(res.val);
			return;
		}
		setProjInfo(res.val);

		if (!currentSubProject && res.val.sub_projects.length > 0) {
			setCurrentSubProject(res.val.sub_projects[0]);
		}
	}

	useEffect(() => {
		if (!props.session || !guid) {
			navigate(Pages.LOGIN)
			return;
		}

		fetchProjectInfo();
	}, [])

	const title = projInfo?.name;

	if (!props.session)
		return <body></body>;

	if (!projInfo)
		// TODO: Style this progress indicator correctly!
		return <CircularProgress />;

	if (!currentSubProject) {
		return <body>
			<Button onClick={async () => {
				if (!props.session)
					return;
				// TODO: This is simply a placeholder until we actually have the UI for adding/viewing subprojects.
				const res = await props.session.create_sub_project(guid!, "ROOT");
				if (res.err) {
					console.log(res.val);
					return;
				}
				fetchProjectInfo();
			}}>Create Root Sub-Project</Button>
		</body>
	}

	const popupBox = () => {
		if (!currentColumnGuid)
			return <></>;

		return <div className="popup-box">
			<div className="popup">
				<div className="content">
					<header>
						<p>Add a New Note</p>
						<i onClick={() => setCurrentColumnGuid(undefined)}>x</i>
					</header>
					<form action='#'>
						<TextField label="Title" onChange={e => setNewNoteTitle(e.target.value)} value={newNoteTitle} />
						<TextField label="Description" onChange={e => setNewNoteDescription(e.target.value)} value={newNoteDescription} multiline />
						<Button id="save-note-button" onClick={async () => {
							if (!props.session || !currentSubProject || !currentColumnGuid)
								return;

							if (!newNoteDescription || !newNoteTitle) {
								// TODO: Show this error to the user!
								console.log("No title or description provided!")
								return;
							}

							// TODO: Display a progress bar when these requests are made!
							const res = await props.session.add_sub_project_card(currentSubProject.guid, currentColumnGuid, newNoteTitle, newNoteDescription);
							if (res.err) {
								// TODO: Show this error to the user!
								console.log("Failed to create new note: " + res.val);
								return;
							}

							await fetchProjectInfo();

							setNewNoteTitle(undefined);
							setNewNoteDescription(undefined);
							setCurrentColumnGuid(undefined);
						}}>Add Note</Button>
					</form>
				</div>
			</div>
		</div>
	}

	return (
		<body>
			<div className="Main-Page">
				<nav>
					<img src="LOGO-HERE" className="logo"></img>
					<h1>{title}</h1>
					<ul>

					</ul>
					<Profile UserName='[NAME HERE]'></Profile>

				</nav>
				{popupBox()}

				<div className="wrapper">
					{projInfo.columns.map(c => <Column key={c.guid} title={c.name} onOpenPopup={() => setCurrentColumnGuid(c.guid)}></Column>)}

					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
						<TextField label="Column Name" onChange={e => setNewColumnName(e.target.value)} value={newColumnName} />
						<Button onClick={async () => {
							if (!newColumnName || !props.session)
								return;

							console.log(newColumnName);
							const res = await props.session.add_project_column(currentSubProject.guid, newColumnName);
							if (res.err) {
								// TODO: Show some error message to the user here!
								console.log(res.val);
								return;
							}

							await fetchProjectInfo();
						}}>Create column</Button>
					</div>
					{/* <Column title="Backing"> */}
					{/* 	<div> */}
					{/* 		<NoteCard title="Title" description="description..." time="time"></NoteCard> */}
					{/* 	</div> */}
					{/* </Column> */}
					{/* <Column title="Design"></Column> */}
					{/* <Column title="To Do"></Column> */}
					{/* <Column title="Doing"></Column> */}

				</div>
			</div>
		</body >

	);
}
