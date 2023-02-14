import React, { useState } from 'react';
import Button from '@mui/material/Button'
import { ProFlow } from "./proflow/ProFlow";
import { ApiError } from "./proflow/core/ApiError";
import { BACKEND_PORT } from "./env";
import './App.css';
import { deepStrictEqual } from 'assert';


class AppState {
	private jwt?: string = undefined;

	get client() {
		return new ProFlow({
			BASE: "http://localhost:" + BACKEND_PORT,
			HEADERS: this.jwt ? { "Authorization": "Bearer " + this.jwt } : undefined
		})
	};


	authorize(jwt: string, expire_sec: number) {
		this.jwt = jwt;
		this.refresh_auth(this.refresh_rate_ms(expire_sec));
	}

	private refresh_auth(timeout_ms: number) {
		console.log("Refreshing in " + timeout_ms + " ms...")
		setTimeout(async () => {
			try {
				const res = await this.client.auth.authRefresh();
				this.jwt = res.jwt;
				console.log("Refreshed auth token!");

				this.refresh_auth(this.refresh_rate_ms(res.expire_sec));
			} catch (e) {
				console.log("Failed to refresh JWT token, trying again...");
				this.refresh_auth(500);
			}
		}, timeout_ms)
	}

	private refresh_rate_ms = (secs: number) => Math.max((secs - 30) * 1000, 1000)

	get is_authorized() { return this.jwt != undefined; }
}

const App = () => {
	const state = new AppState();
	const login_email = "user@gmail.com";
	const login_password = "test";
	//Drop down menu event handler. 
	//  let subMenu = document.getElementById("subMenu");
	//  function toggleMenu(){
	// 	 return subMenu!.classList.toggle("open-menu");
	// 	}
		

	return (
	<body>
		<div className = "Main-Page">
			<nav>
				<img src="/Users/jhylee17/ProFlow/packages/frontend/src/logo192.png" className = "logo"></img>
				<ul>
					<li>
						<Button variant="contained" className = "Button-Design"onClick={async () => {
						try {
							const res = await state.client.auth.authSignup({ email: login_email, password: login_password });
							state.authorize(res.jwt, res.expire_sec);
						} catch (e) {
							if (e instanceof ApiError) {
								console.log("Request failed (" + e.status + ") error: " + e.body.message);
							}
						}
						}}>Signup</Button>
					</li>

					<li>
						<Button variant="contained" onClick={async () => {
							const res = await state.client.auth.authLogin({ email: login_email, password: login_password });
							console.log("Logged in " + res.jwt)
							state.authorize(res.jwt, res.expire_sec);
						}}>Login</Button>
						
					</li>
					<li>
						<Button variant="contained" onClick={async () => {
							const res = await state.client.user.getUserProjects();
							console.log("Get projects " + res.project_guids)
						}}>Get Projects</Button>
					</li>


				</ul>
				
				<img src = "User-Image-Here" className = "user-pic" onClick = {toggleMenu}></img>
				<div className = "drop-down-menu" id="subMenu">
					<div className = "drop-down">
						<div className = "user-profile">
						<img src='placehold.it/200x200'/>
						<h2>User Name Here</h2>
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



				</div>


			</nav>


		<div className = "popup-box">
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
		
		<div className = "wrapper">
			<li className = "note">
				<div className="details">
					<p>Backing</p>
					<hr></hr>
				</div>
				//TODO: card attempt here
				<div className = "note-card">
						<p>Title</p>
						<span>Description...</span>
						<div className="bottom-content">
							<span>Time</span>
							<div className='settings'>
								<i>Setting</i>
								<ul className="menu">
									<li>Edit</li>
									<li>Delete</li>
								</ul>
							</div>
							
						</div>
				</div>
				
				<div className = "add-buttom">
				<Button id="add-note-button" onClick={addNotesButton}>Add new Notes</Button>
				</div>
			</li>

			<li className = "note">
				<div className="details">
					<p>Design</p>
					<hr></hr>
				</div>
				<div className = "bottom">
				<Button>Add new Notes</Button>
				</div>
			</li>
			<li className = "note">
				<div className="details">
					<p>To Do</p>
					<hr></hr>
				</div>
				<div className = "bottom">
				<Button>Add new Notes</Button>
				</div>
			</li>
			<li className = "note">
				<div className="details">
					<p>Doing</p>
					<hr></hr>
				</div>
				<div className = "bottom">
				<Button>Add new Notes</Button>
				</div>
			</li>
			
				
		</div>
		</div>
		

	</body>
	
	);
}

//User Menu Dropdown 
function toggleMenu(){
	let subMenu = document.getElementById("subMenu");
	return subMenu!.classList.toggle("open-menu");
}

//Show ADD NEW NOTES popup
const addBox = document.getElementById("add-note-button");
function addNotesButton(){
	let popupBox = document.querySelector(".popup-box");
	return popupBox!.classList.add("show");
}

//Hide ADD NEW NOTES popup
function closeAddNotesIcon(){
	let popupBox = document.querySelector(".popup-box");
	return popupBox!.classList.remove("show");
}
const notes = JSON.parse(localStorage.getItem("notes") || "[]")
//TODO: Show all the notes in localStorage
function showNotes(){
	notes.forEach((note:string) => {
		//Add a card for each string stored in local memory.
		//addBox!.insertAdjacentHTML("afterend", divTag);
	});
}

//Add new notes
function addNotes(){
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


export default App;
