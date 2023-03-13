import { Button, TextField, Alert, LinearProgress, Snackbar, IconButton, Drawer } from '@mui/material'
import { Session, ProjectInfo, SubProject, SubProjectColumnCards, Card, User, init_proflow_client } from "../../client"
// import './index.css';
import Pages from "../../pages";
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Select, MenuItem, FormControl, InputLabel, Tooltip } from "@mui/material";
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ProFlow } from '../../proflow';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FaceIcon from '@mui/icons-material/Face';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Result, Err, Ok } from "ts-results";


interface ColumnProps {
	title: string;
	guid: string;
	onCreateCard: () => void;
	onEditCard: (card: Card) => void;
	onDeleteCard: (card: Card) => void;
	onDeleteColumn: () => Promise<void>;
	onRenameColumn: (name: string) => Promise<Result<void, string>>;
	onMoveCard: (card: Card, to_column: string, to_priority: number) => void;
	cards?: SubProjectColumnCards;
}

enum DragTypes {
	CARD = 'card',
}

function PlaceholderCard(props: { card: Card }) {
	return <div style={{ backgroundColor: "#808080", borderRadius: "10px" }}>
		<div style={{ opacity: 0 }}>
			<RenderedNoteCard card={props.card} onEditCard={() => { }} onDeleteCard={() => { }} />
		</div>
	</div>
}

function Column(props: ColumnProps) {
	const [newName, setNewName] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [errorRename, setErrorRename] = useState<string | undefined>(undefined);

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
			return <div ref={dropRef} style={{ width: "100%", height: "90%" }}>
				{isOver && <PlaceholderCard card={item.card} />}
			</div>
		}

		let cards = raw_cards.sort((a, b) => a.priority - b.priority).map(c => {
			return <NoteCard key={c.guid} card={c} onDrop={onCardDrop} onEditCard={props.onEditCard} onDeleteCard={props.onDeleteCard} />
		})

		return cards;
	}

	return <div style={{
		width: "230pt",
		marginLeft: "min(2.5vw, 10pt)",
		marginRight: "min(2.5vw, 10pt)",
		marginTop: 0,
		marginBottom: 0,
		backgroundColor: "#ececec",
		padding: "10pt",
		borderRadius: "10px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "start",
		alignContent: "center",

	}}>
		<div className="details">
			<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
				<h3 style={{ flexGrow: 1, marginLeft: "8pt" }}>{props.title}</h3>
				<Button sx={{}} id="add-note-button" onClick={() => { setNewName(props.title) }}>
					<EditIcon />
				</Button>
			</div>
			{
				newName != undefined &&
				<div className='renaming'>
					<TextField label="New Name" sx={{ margin: 1 }} onChange={e => setNewName(e.target.value)} value={newName} />
					<Button sx={{ margin: 1 }} variant="outlined" onClick={async () => {
						if (!newName || newName.length === 0) {
							setErrorRename("Column name must not be empty!");
							return;
						}
						setLoading(true);
						const res = await props.onRenameColumn(newName);
						setLoading(false);

						if (res.err) {
							setErrorRename(res.val);
							return;
						}

						setErrorRename(undefined);
						setNewName(undefined);
					}}>
						Submit</Button>
				</div>
			}
			{
				loading &&
				<LinearProgress color="primary"></LinearProgress>
			}
			{
				errorRename &&
				<Alert severity="error" color="error">{errorRename}</Alert>
			}
			<hr></hr>
		</div>
		<div className="add-button">
			<Button id="add-note-button" sx={{ margin: 1 }} onClick={props.onCreateCard}>Add New Notes</Button>
			<Button id="add-note-button" sx={{ margin: 1 }} onClick={props.onDeleteColumn} startIcon={<DeleteIcon />}></Button>
		</div>
		<div style={{
			width: "100%",
			overflowY: "scroll",
			overflowX: "hidden",
			flex: "1 1 1px",
		}}>
			{columnCards()}
		</div>

	</div>;
}

// interface ProfileOptions {
// 	userName: string;
// 	children?: React.ReactNode,

// }

// function Profile(props: ProfileOptions) {
// 	const navigate = useNavigate();
// 	return <div><img src={require("./logo192.png")} className="user-pic" onClick={toggleMenu}></img>
// 		<div className="drop-down-menu" id="subMenu">
// 			<div className="drop-down">
// 				<div className="user-profile">
// 					<img src={require("./logo192.png")} />
// 					<h2>{props.userName}</h2>
// 				</div>
// 				<hr></hr>

// 				<a href='#' className="drop-down-link">
// 					<p onClick={() => navigate(Pages.USER)}>View Other Projects</p>
// 				</a>
// 				<a href='#' className="drop-down-link">
// 					<p onClick={() => navigate(Pages.LOGIN)}>Logout</p>
// 				</a>
// 			</div>
// 		</div></div>
// }


interface RenderedNoteProps {
	card: Card;
	onEditCard: (card: Card) => void;
	onDeleteCard: (card: Card) => void;
	ref?: React.MutableRefObject<HTMLDivElement>,
}

function RenderedNoteCard(props: RenderedNoteProps) {
	return <div ref={props.ref} style={{ backgroundColor: "white", padding: "5pt", marginTop: "10pt", borderRadius: "10px" }}>
		<h3 style={{ marginLeft: "2pt", marginTop: "2pt" }}>{props.card.title}</h3>
		<hr />
		<p style={{
			whiteSpace: "pre-wrap",
			display: "-webkit-box",
			WebkitLineClamp: 4,
			WebkitBoxOrient: "vertical",
			textOverflow: "ellipsis",
			overflow: "hidden",
			color: "grey"
		}}>{props.card.description}</p>
		<div style={{
			display: "flex",
			flexDirection: "row",
			justifyContent: "start",
			alignItems: "center",
			color: "grey"
		}}>
			<AccessTimeIcon style={{ marginRight: "5pt" }} />
			<span style={{ fontSize: "0.8em", flexGrow: 1 }}>{props.card.date_created.toDateString()}</span>
			{props.card.assignee &&
				<Tooltip title={props.card.assignee.email}>
					<FaceIcon style={{ marginRight: "5pt", color: "grey" }}></FaceIcon>
				</Tooltip>
			}
		</div>
		<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
			<Button className='edit-card' onClick={() => props.onEditCard(props.card)}><EditIcon /></Button>
			<Button className='delete-card' onClick={() => props.onDeleteCard(props.card)}><DeleteIcon /></Button>
		</div>
	</div>;
}

interface NoteProps {
	card: Card;
	onEditCard: (card: Card) => void;
	onDeleteCard: (card: Card) => void;
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
					<RenderedNoteCard card={props.card} onEditCard={props.onEditCard} onDeleteCard={props.onDeleteCard} />
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

interface EditPopup {
	columnGuid?: string,
	cardGuid?: string,
	title: string,
	description: string,
	assignee?: User,
	errorMsg?: string,
	showProgress: boolean,
}

const DEFAULT_EDIT_POPUP: EditPopup = { title: "", description: "", showProgress: false }

export default function ProjectView(props: ProjectViewProps) {
	const { guid } = useParams();
	const navigate = useNavigate();
	const [projInfo, setProjInfo] = useState<ProjectInfo | undefined>(undefined);
	const [currentSubProject, setCurrentSubProject] = useState<SubProject | undefined>(undefined);
	const [cards, setCards] = useState<SubProjectColumnCards | undefined>(undefined);
	const [newColumnName, setNewColumnName] = useState<string>("");

	const [editPopup, setEditPopup] = useState<EditPopup | undefined>();

	const [showProgress, setShowProgress] = useState<boolean>(false);
	const [popupError, setPopupError] = useState<string | undefined>(undefined);

	const [showAppDrawer, setShowAppDrawer] = useState<boolean>(false);

	const handleCloseDrag = (_?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setPopupError(undefined);
	};

	const fetchProjectInfo = async () => {
		if (!guid || !props.session)
			return;

		const res = await props.session.get_project_info(guid);
		if (res.err) {
			setPopupError(res.val);
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
				setPopupError(res.val);
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
				const new_session = new Session(user_email, user_guid, jwt, expire_sec);
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

	if (!props.session)
		return <body></body>;

	if (!projInfo)
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
		if (!editPopup)
			return <></>;

		return <div style={{
			position: "absolute",
			width: "100%",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			zIndex: 10,
			backdropFilter: "blur(10px)",
		}}>
			<div style={{
				minWidth: "250pt",
				maxWidth: "250pt",
				backgroundColor: "white",
				borderRadius: "10px",
				padding: "10pt"
			}}>
				<header style={{ display: "flex", flexDirection: "row" }}>
					<p style={{ flexGrow: 1 }}>Add a New Note</p>
				</header>
				<TextField
					fullWidth
					label="Title"
					sx={{ marginTop: "5pt", marginBottom: "5pt" }}
					onChange={e =>
						setEditPopup(prev => ({
							...(prev ?? DEFAULT_EDIT_POPUP),
							title: e.target.value
						}))
					}
					value={editPopup.title} />
				<FormControl
					fullWidth>
					<InputLabel id="select-assignee">Assignee</InputLabel>
					<Select
						value={editPopup.assignee?.guid ?? "NONE"}
						labelId="select-assignee"
						label="Assignee"
						sx={{ marginTop: "5pt", marginBottom: "5pt" }}
						onChange={e => {
							const assignee = projInfo.members.find(user => user.guid == e.target.value);
							setEditPopup(prev => ({ ...(prev ?? DEFAULT_EDIT_POPUP), assignee }))
						}
						}>
						<MenuItem value={"NONE"}>None</MenuItem>
						{projInfo.members.map(user => <MenuItem key={user.guid} value={user.guid}>{user.email}</MenuItem>)}
					</Select>
				</FormControl>
				<TextField
					fullWidth
					label="Description"
					sx={{ marginTop: "5pt", marginBottom: "5pt" }}
					onChange={e =>
						setEditPopup(prev => ({
							...(prev ?? DEFAULT_EDIT_POPUP),
							description: e.target.value
						}))
					}
					value={editPopup.description} multiline />
				{
					editPopup.errorMsg &&
					<div>
						<Alert sx={{ margin: 1 }} color="error" severity='error'>{editPopup.errorMsg}</Alert>
					</div>
				}
				<Button onClick={async () => {
					if (editPopup.cardGuid == undefined && editPopup.columnGuid == undefined) {
						return;
					}

					if (!props.session || !currentSubProject || !editPopup)
						return;

					if (editPopup.title.length === 0 || editPopup.description.length === 0) {
						setEditPopup(prev => ({ ...(prev ?? DEFAULT_EDIT_POPUP), errorMsg: "Missing title or description!" }));
						return;
					}

					setEditPopup(prev => ({ ...(prev ?? DEFAULT_EDIT_POPUP), showProgress: true }));
					let res: Result<void, string>;
					if (editPopup.columnGuid != undefined) {
						res = await props.session.add_sub_project_card(currentSubProject.guid, editPopup.columnGuid, editPopup.title, editPopup.description);
					} else {
						res = await props.session.edit_sub_project_card(currentSubProject.guid, editPopup.cardGuid!, {
							title: editPopup.title,
							description: editPopup.description,
							assignee: editPopup.assignee?.guid ?? "NONE"
						});
					}
					setEditPopup(prev => ({ ...(prev ?? DEFAULT_EDIT_POPUP), showProgress: false }));

					if (res.err) {
						const errorMsg = res.val;
						setEditPopup(prev => ({ ...(prev ?? DEFAULT_EDIT_POPUP), errorMsg }));
						return;
					}

					await fetchProjectInfo();

					setEditPopup(undefined);
				}}>{editPopup.columnGuid != undefined ? "Add Note" : "Save Edits"}</Button>
				<Button onClick={() => setEditPopup(undefined)} color="error">Cancel</Button>

				{editPopup.showProgress &&
					<LinearProgress sx={{ margin: 1 }} color="primary" />
				}
			</div>
		</div>
	}

	return (
		<DndProvider backend={HTML5Backend}>
			{showProgress &&
				<LinearProgress sx={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }} color="primary" />}
			<div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
				<div style={{
					height: "7vh",
					width: "min-content",
					backgroundColor: "#ececec",
					marginTop: "max(1vh, 5pt)",
					marginLeft: "30pt",
					borderRadius: "10px",
					paddingLeft: "2vw",
					paddingRight: "2vw",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "start",
				}}>
					<IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => setShowAppDrawer(true)}>
						<MenuIcon />
					</IconButton>
					<h2 style={{ fontSize: "2.2em", whiteSpace: "nowrap", marginRight: "3vw" }}>{projInfo.name}</h2>
					<Tooltip title={projInfo.members.length + " members"}>
						<PeopleIcon></PeopleIcon>
					</Tooltip>
				</div>
				{popupBox()}
				{/* <div className='side-wrapper'> */}
				{/* <div className='side-panel'> */}
				{/* 	<h2> */}
				{/* 		Project */}
				{/* 		<hr></hr> */}
				{/* 		<Button>Project1</Button> */}
				{/* 		<Button>Project2</Button> */}
				{/* 	</h2> */}
				{/* </div> */}
				{/* <button className='side-panel-toggle' type='button' onClick={toggleSidePanel}> */}
				{/* 	<span className="open"><ArrowForwardIosIcon /></span> */}
				{/* 	<span className="close"><ArrowBackIosIcon /></span> */}
				{/* </button> */}
				<div
					className="wrapper"
					style={{
						display: "grid",
						flexGrow: 1,
						gridAutoFlow: "column",
						justifyContent: "start",
						marginLeft: "20pt",
						marginRight: "20pt",
						marginTop: "max(2vh, 5pt)",
						marginBottom: "max(5vh, 5pt)",
					}}>
					{projInfo.columns.map(c =>
						<Column
							key={c.guid}
							guid={c.guid}
							title={c.name}
							cards={cards}
							onCreateCard={() => setEditPopup({ ...DEFAULT_EDIT_POPUP, columnGuid: c.guid })}
							onMoveCard={async (card, to_column, to_priority) => {
								if (!props.session || !guid) {
									setPopupError("Unknown error!");
									return;
								}

								// TODO(Brandon): Before we even make the request, we should probably do some client-side prediction so that it feels less laggy...

								const res = await props.session.edit_sub_project_card(currentSubProject.guid, card.guid, { to_priority, to_column });
								if (res.err) {
									setPopupError(res.val);
									return;
								}

								setPopupError(undefined);

								await fetchProjectInfo();
							}}
							onEditCard={card => setEditPopup({
								title: card.title,
								description: card.description,
								assignee: card.assignee,
								cardGuid: card.guid,
								showProgress: false
							})}
							onDeleteCard={async card => {
								if (!props.session || !guid) {
									return;
								}

								const res = await props.session.delete_sub_project_card(currentSubProject.guid, card.guid);
								if (res.err) {
									setPopupError(res.val);
									return;
								}

								setPopupError(undefined);

								await fetchProjectInfo();
							}}
							onDeleteColumn={async () => {
								if (!props.session || !guid) {
									return;
								}

								const res = await props.session.delete_project_column(guid, c.guid);
								if (res.err) {
									setPopupError(res.val);
									return;
								}

								setPopupError(undefined);

								await fetchProjectInfo();
							}}
							onRenameColumn={async (name): Promise<Result<void, string>> => {
								if (!props.session || !guid) {
									return Err("Unknown error!");
								}

								const res = await props.session.rename_project_column(guid, c.guid, name);
								if (res.err) {
									return res;
								}

								await fetchProjectInfo();
								return Ok.EMPTY;
							}}
						/>

					)}
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: "230pt" }}>
						<TextField label="Column Name" onChange={e => setNewColumnName(e.target.value)} value={newColumnName} />
						{showProgress &&
							<LinearProgress sx={{ margin: 1 }} color="primary" />
						}
						<Button onClick={async () => {
							if (!newColumnName || !props.session || !guid)
								return;

							setShowProgress(true);
							const res = await props.session.add_project_column(guid, newColumnName);
							setShowProgress(false);
							if (res.err) {
								setPopupError(res.val);
								return;
							}

							setPopupError(undefined);
							setNewColumnName("");

							await fetchProjectInfo();
						}}>Create column</Button>
					</div>
				</div>
				<Snackbar open={popupError != undefined} autoHideDuration={6000} onClose={handleCloseDrag}>
					<Alert onClose={handleCloseDrag} severity="error" sx={{ width: '100%' }}>
						{popupError}
					</Alert>
				</Snackbar>
			</div>
		</DndProvider>
	);
}
