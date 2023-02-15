import Button from '@mui/material/Button'
import { ProFlow } from "./proflow/ProFlow";
import { ApiError } from "./proflow/core/ApiError";
import { BACKEND_PORT } from "./env";
import './App.css';
import './App.tsx'
import { deepStrictEqual } from 'assert';

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
        <div className = "add-buttom">
			<Button id="add-note-button" onClick={addNotesButton}>Add new Notes</Button>
		</div>
    </li>;
}

//User Profile
export interface ProfileOptions {
    //User Name is probabily the only custmizable object here. 
    UserName : string;
    children?: React.ReactNode,
    
}
export function Profile(props: ProfileOptions){
    return <div><img src = "User-Image-Here" className = "user-pic" onClick = {toggleMenu}></img>
            <div className = "drop-down-menu" id="subMenu">
					<div className = "drop-down">
						<div className = "user-profile">
						<img src='placehold.it/200x200'/>
						<h2>{props.UserName}</h2>
						</div>
						<hr></hr>

						<a href='#' className = "drop-down-link">
						<p>Switch accounts</p>
						</a>

						<a href='#' className = "drop-down-link">
						<p>Manage Account</p>
						</a>

						<a href='#' className = "drop-down-link">
						<p>Profile and visibility</p>
						</a>

						<a href='#' className = "drop-down-link">
						<p>Settings</p>
						</a>
						<hr></hr>
						<a href='#' className = "drop-down-link">
						<p>Can add other functionalities here</p>
						</a>
					</div>
			</div></div>
}

//Small Node Card
export interface NoteProps{
    title: string;
    description: string;
    time: string;
    children?: React.ReactNode,
}
export function NoteCard(props: NoteProps){
    return <div className = "note-card">
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
export function PopupBox(){
    return 		<div className = "popup-box">
                    <div className = "popup">
                        <div className = "content">
                            <header>
                                <p>Add a New Note</p>
                                <i onClick={closeAddNotesIcon}>x</i>
                            </header>
                            <form action='#'>
                                <div className = "row">
                                    <label>Title</label>
                                    <input type="text"></input>
                                </div>
                                <div className = "row description">
                                    <label>Description</label>
                                    <textarea></textarea>
                                </div>
                                <Button id="save-note-button" onClick={addNotes}>Add Note</Button>
                            </form>
                        </div>
                    </div>
                </div>
}

//Helper Functions Below:

//Show User Menu
export function toggleMenu(){
	let subMenu = document.getElementById("subMenu");
	return subMenu!.classList.toggle("open-menu");
}

//Show ADD NEW NOTES popup
const addBox = document.getElementById("add-note-button");
export function addNotesButton(){
	let popupBox = document.querySelector(".popup-box");
	return popupBox!.classList.add("show");
}

//Hide ADD NEW NOTES popup
export function closeAddNotesIcon(){
	let popupBox = document.querySelector(".popup-box");
	return popupBox!.classList.remove("show");
}
const notes = JSON.parse(localStorage.getItem("notes") || "[]")
//TODO: Show all the notes in localStorage
export function showNotes(){
	notes.forEach((note:string) => {
		//Add a card for each string stored in local memory.
		//addBox!.insertAdjacentHTML("afterend", divTag);
	});
}

//Add new notes
export function addNotes(){
	let addButton = document.getElementById("save-note-button")
	let titleTag = document.querySelector("input")
	let descriptionTag = document.querySelector("textarea")
	let noteTitle = titleTag?.value;
	let noteDescription = descriptionTag?.value;
	const monthArray = ["January", "February", "March", "April", "May", "June", "July", 
					"August", "September", "October", "November","December"];
	
	if(noteTitle || noteDescription){
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
