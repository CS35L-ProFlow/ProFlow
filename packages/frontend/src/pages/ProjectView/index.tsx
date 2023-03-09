import { Button, TextField, Alert, Typography, LinearProgress } from '@mui/material/'
import { Session, ProjectInfo, SubProject, SubProjectColumnCards, Card, init_proflow_client } from "../../client"
import './index.css';
import Pages from "../../pages";
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress} from "@mui/material";
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, HTML5Backend } from 'react-dnd-html5-backend'
import { ProFlow } from '../../proflow';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface ColumnProps {
	title: string;
	guid: string;
	onOpenPopup: () => void;
	deleteColumn?: () => void; // TODO: Delete column 
	renameColumn?: () => void;
	onMoveCard: (card: Card, to_column: string, to_priority: number) => void;
	cards?: SubProjectColumnCards;
}

enum DragTypes {
	CARD = 'card',
}

function PlaceholderCard(props: { card: Card }) {
	return <div style={{ backgroundColor: "yellow" }}>
		<div style={{ opacity: 0 }}>
			<RenderedNoteCard card={props.card} />
		</div>
	</div>
}

function Column(props: ColumnProps) {
	const [rename, setRename] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorCard, setErrorCard] = useState(false);

	const onCardDrop = (card: Card, priority: number) => {

		if (card.column_guid === props.guid) {
			if (priority === card.priority)
				return;
			if (card.priority < priority) {
				priority--;
			}
		}

		props.onMoveCard(card, props.guid, priority);
	};

	const [{ isOver, item }, dropRef] = useDrop(
		() => ({
			accept: DragTypes.CARD,
			drop: (item: { card: Card }) => {
				onCardDrop(item.card, 0);
			},
			collect: (monitor) => ({
				item: monitor.getItem<{ card: Card }>(),
				isOver: monitor.isOver(),
				didDrop: monitor.didDrop(),
			})
		}),
		[props.cards]
	)

	const columnCards = () => {
		if (!props.cards)
			return <CircularProgress />

		const raw_cards = props.cards.cards.get(props.guid);
		if (!raw_cards) {
			// TODO: style this...
			return <Alert variant="outlined" severity="error" sx={{ margin: 2, maxWidth: "100%", textAlign: "left" }}>
				Failed to get cards for column that doesn't exist!</Alert>;
		}

		if (raw_cards.length === 0) {
			return <div ref={dropRef} style={{ width: "100%", minHeight: "40px" }}>
				{isOver && <PlaceholderCard card={item.card} />}
			</div>
		}

		let cards = raw_cards.sort((a, b) => a.priority - b.priority).map(c => {
			return <NoteCard key={c.guid} card={c} onDrop={onCardDrop} />
		})

		return cards;
	}

	return (<li className="note">
		<div className="details">
			<Typography className="p" align='center' margin={1} justifyContent={"space-between"} marginLeft={"5%"}>{props.title}<Button id="add-note-button" onClick={()=>setRename(true)}><EditIcon opacity="50%"/></Button></Typography>
			{
				rename &&
				<div className='renaming'>
					<TextField label="New Name" sx={{margin:1}} />
					<Button sx={{margin:1}} variant="outlined" onClick={ () => {
						setLoading(true);
						if(!props.renameColumn){
							setErrorCard(true);
						}
						setLoading(false);
						setErrorCard(false);
						setRename(false);
						}}>
							Submit</Button>
				</div>
			}
			{
				loading && 
				<LinearProgress color="primary"></LinearProgress>
			}
			{
				errorCard && 
				<Alert severity="error" color="error">Error renaming card</Alert>
			}
			<hr></hr>
		</div>
		<div className="add-button">
			<Button id="add-note-button" sx={{margin:1}} onClick={props.onOpenPopup}>Add new Notes</Button>
			<Button id="add-note-button" sx={{margin:1}} onClick={props.deleteColumn} startIcon={<DeleteIcon/>}></Button>
		</div>
		{columnCards()}

	</li>);
}

interface ProfileOptions {
	userName: string;
	children?: React.ReactNode,

}

function Profile(props: ProfileOptions) {
	return <div><img src="User-Image-Here" className="user-pic" onClick={toggleMenu}></img>
		<div className="drop-down-menu" id="subMenu">
			<div className="drop-down">
				<div className="user-profile">
					<img src='placehold.it/200x200' />
					<h2>{props.userName}</h2>
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


interface RenderedNoteProps {
	card: Card
	ref?: React.MutableRefObject<HTMLDivElement>,
}

function RenderedNoteCard(props: RenderedNoteProps) {
	return <div className={`note-card`} ref={props.ref}>
		<p>{props.card.title}</p>
		{/* <span>{props.card.description}</span> */}
		<span>Priority {props.card.priority}</span>
		<div className="bottom-content">
			{/* <div className='settings'>
				<i>Setting</i>
				<ul className="menu">
					<li>Edit</li>
					<li>Delete</li>
				</ul>
			</div> */}
		</div>
	</div>;
}

interface NoteProps {
	card: Card
	onDrop: (dropped: Card, priority: number) => void,
}

enum NoteDropPosition {
	BEFORE,
	AFTER,
	NONE,
}

function NoteCard(props: NoteProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number>(0);

	const [{ isDragging }, dragRef] = useDrag(
		() => ({
			type: DragTypes.CARD,
			item: { card: props.card },
			collect: monitor => ({
				isDragging: monitor.isDragging()
			})
		}),
		[props.card]
	)

	const isAfter = (monitor: DropTargetMonitor<{ card: Card }>) => {
		const box = ref.current?.getBoundingClientRect();
		const y = monitor.getClientOffset()?.y;
		if (!box || !y)
			return NoteDropPosition.NONE;

		const offset = y - (box.top + height / 2);
		return offset > 0;
	}

	const getDropPosition = (monitor: DropTargetMonitor<{ card: Card }>) => {
		if (!monitor.isOver() || !monitor.canDrop())
			return NoteDropPosition.NONE;

		const after = isAfter(monitor);

		const delta = after ? 1 : -1;

		const card = monitor.getItem()?.card;
		if (!card) {
			return;
		}

		if (card.column_guid === props.card.column_guid && card.priority === props.card.priority + delta) {
			return NoteDropPosition.NONE;
		}

		return after ? NoteDropPosition.AFTER : NoteDropPosition.BEFORE;
	}

	const [{ dropPosition, item }, dropRef] = useDrop(
		() => ({
			accept: DragTypes.CARD,
			drop: (item, monitor) => {
				const after = isAfter(monitor);
				const delta = after ? 1 : 0;
				props.onDrop(item.card, props.card.priority + delta);
			},
			canDrop: (item: { card: Card }) => item.card.guid !== props.card.guid,
			collect: (monitor) => ({
				dropPosition: getDropPosition(monitor),
				item: monitor.getItem(),
			})
		}),
		[props.card, ref, height]
	)

	useLayoutEffect(() => {
		setHeight(ref.current?.getBoundingClientRect().height ?? 0);
	})

	return (
		<div ref={dropRef}>
			{dropPosition == NoteDropPosition.BEFORE && <PlaceholderCard card={item.card} />}
			<div
				ref={dragRef}
				style={{ opacity: isDragging ? 0 : 1 }}
			>
				<div ref={ref}>
					<RenderedNoteCard card={props.card} />
				</div>
			</div>
			{dropPosition == NoteDropPosition.AFTER && <PlaceholderCard card={item.card} />}
		</div>
	);

}

//Show User Menu
function toggleMenu() {
	let subMenu = document.getElementById("subMenu");
	return subMenu!.classList.toggle("open-menu");
}

//Toggle side panel
function toggleSidePanel() {
	let sidePanel = document.querySelector(".side-panel");
	let sidePanelOpen = document.querySelector(".side-panel-toggle")
	sidePanelOpen!.classList.toggle("side-panel-open")
	return sidePanel!.classList.toggle("open-side-panel")

}

interface ProjectViewProps {
	session: Session | undefined,
	onRefresh: (session: Session) => void,
};

export default function ProjectView(props: ProjectViewProps) {
	const { guid } = useParams();
	const navigate = useNavigate();
	const [projInfo, setProjInfo] = useState<ProjectInfo | undefined>(undefined);
	const [currentSubProject, setCurrentSubProject] = useState<SubProject | undefined>(undefined);
	const [cards, setCards] = useState<SubProjectColumnCards | undefined>(undefined);
	const [errorPop, setErrorPop] = useState(false);
	const [progress, setProgress] = useState(false);
	const [errorPopNotes, setErrorPopNotes] = useState(false);

	const [newColumnName, setNewColumnName] = useState<string | undefined>(undefined);

	// TODO: Maybe group these state objects together since they're all related to creating a new card?
	const [currentColumnGuid, setCurrentColumnGuid] = useState<string | undefined>(undefined);
	const [newNoteTitle, setNewNoteTitle] = useState<string | undefined>(undefined);
	const [newNoteDescription, setNewNoteDescription] = useState<string | undefined>(undefined);

	const fetchProjectInfo = async () => {
		if (!guid || !props.session)
			return;

		const res = await props.session.get_project_info(guid);
		if (res.err) {
			// TODO: Show some error message to the user here!
			console.log(res.val);
			return;
		}
		const proj_info = res.val;
		setProjInfo(proj_info);

		let sub_proj = currentSubProject;
		if (!currentSubProject && proj_info.sub_projects.length > 0) {
			sub_proj = proj_info.sub_projects[0];
			setCurrentSubProject(sub_proj);
		}

		if (sub_proj) {
			const res = await props.session.get_sub_project_cards(proj_info, sub_proj.guid);
			if (res.err) {
				// TODO: Show some error message to the user here!
				console.log(res.val);
				return;
			}
			setCards(undefined);
			setCards(res.val);
		}
	}

	useEffect(() => {

		const refreshJwt = async (client: ProFlow, jwt: string) => {
			try {
				const res = await client.auth.authRefresh();
				const user_guid = res.user_guid;
				const expire_sec = res.expire_sec;
				const queryRes = await client.user.queryUser(user_guid);
				const user_email = queryRes.email;
				const new_session = await new Session(user_email, user_guid, jwt, expire_sec);
				props.onRefresh(new_session);
			} catch (e) {
				console.log("Failed to refresh JWT token");
				navigate(Pages.LOGIN);
			}
		}

		if (!guid) {
			navigate(Pages.LOGIN)
			return;
		}

		if (!props.session) {
			const jwt = localStorage.getItem("jwt");
			const expirationDate = localStorage.getItem("expirationDate");
			if (!jwt || Number(expirationDate) < Date.now()) {
				navigate(Pages.LOGIN);
				return;
			}
			const client = init_proflow_client(jwt);
			refreshJwt(client, jwt);

		}

		fetchProjectInfo();
	}, [props.session])

	// DragAndDrop();

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
					<form action='#' className="note-form">
						<TextField label="Title" sx={{marginBottom:1}} onChange={e => setNewNoteTitle(e.target.value)} value={newNoteTitle} />
						<TextField label="Description" sx={{marginBottom:1}} onChange={e => setNewNoteDescription(e.target.value)} value={newNoteDescription} multiline />
						{
							errorPopNotes && 
							<div>
								<Alert sx={{margin:1}} color="error" severity='error'>No title/description provided</Alert>
							</div>
							}
						<Button id="save-note-button" onClick={async () => {
							if (!props.session || !currentSubProject || !currentColumnGuid)
								return;

							if (!newNoteDescription || !newNoteTitle) {
								// TODO: Show this error to the user!
								setErrorPopNotes(true);
								console.log("No title or description provided!")
								return;
							}

							// TODO: Display a progress bar when these requests are made!
							setProgress(true);
							const res = await props.session.add_sub_project_card(currentSubProject.guid, currentColumnGuid, newNoteTitle, newNoteDescription);
							setProgress(false);

							if (res.err) {
								// TODO: Show this error to the user!
								setErrorPopNotes(true);
								console.log(res.val);
								return;
							}

							await fetchProjectInfo();

							setNewNoteTitle(undefined);
							setNewNoteDescription(undefined);
							setCurrentColumnGuid(undefined);
							setErrorPopNotes(false);
						}}>Add Note</Button>
					</form>
						{progress &&
						<LinearProgress sx={{margin:1}} color="primary" />
						}
				</div>
			</div>
		</div>
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<body>
				<div className="Main-Page">
					<nav>
						<img src="LOGO-HERE" className="logo"></img>
						<ul>

						</ul>
						<Profile userName='[NAME HERE]'></Profile>
						{/* TODO: This is temporary, ideally we'll just periodically refresh or even better . */}
						<Button onClick={async () => { await fetchProjectInfo() }}>Refresh</Button>

					</nav>
					{popupBox()}
					<div className='side-wrapper'>
						<div className='side-panel'>
							<h2>
								Project
								<hr></hr>
								<Button>Project1</Button>
								<Button>Project2</Button>
							</h2>
						</div>
						<button className='side-panel-toggle' type='button' onClick={toggleSidePanel}>
							<span className="open">open</span>
							<span className="close">close</span>
						</button>
						<div className='main'>
							<div className="wrapper">
								{projInfo.columns.map(c =>
									<Column
										key={c.guid}
										guid={c.guid}
										title={c.name}
										onOpenPopup={() => setCurrentColumnGuid(c.guid)} cards={cards}
										onMoveCard={async (card, to_column, to_priority) => {
											if (!props.session || !guid)
												return;

											// TODO(Brandon): Before we even make the request, we should probably do some client-side prediction so that it feels less laggy...

											const res = await props.session.edit_sub_project_card(currentSubProject.guid, card.guid, { to_priority, to_column });
											if (res.err) {
												// TODO: Show some error message to the user here!
												console.log(res.val);
											}

											await fetchProjectInfo();
										}}
									/>
								)}
								<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
									<TextField label="Column Name" onChange={e => setNewColumnName(e.target.value)} value={newColumnName} />
											{
											errorPop && 
											<div>
												<Alert sx={{marginTop:1}} color="error" severity='error'>Check the card name</Alert>
											</div>
											}
											{progress &&
												<LinearProgress sx={{margin:1}} color="primary" />
											}
									<Button onClick={async () => {
										if (!newColumnName || !props.session || !guid)
											return;

										console.log(newColumnName);
										setProgress(true);
										const res = await props.session.add_project_column(guid, newColumnName);
										setProgress(false);
										if (res.err) {
											// TODO: Show some error message to the user here!
											setErrorPop(true);
											return;
										}
										setErrorPop(false);
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
					</div>
				</div>
			</body>
		</DndProvider>
	);
}


function getDragAfterElement(list: any, y: number) {
	//TODO: Figure out how to change the array dynamically. 
	// Currently, the drag and drop features only work on the cards that are displayed when
	// enterting the page. The newly added cards will not have this feature. 

	const draggableElements = [...list.querySelectorAll('.note-card:not(.dragging)')]
	return draggableElements.reduce((closest, child) => {
		const box = child.getBoundingClientRect()
		const offset = y - box.top - box.height / 2
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child }
		} else {
			return closest

		}

	}, { offset: Number.NEGATIVE_INFINITY }).element
}