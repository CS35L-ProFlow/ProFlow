import {
	Button,
	TextField,
	Alert,
	LinearProgress,
	Snackbar,
	IconButton,
	Drawer,
	Divider,
	Box,
	Typography,
	Menu,
	CircularProgress,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material'

import { TreeView, TreeItem, TreeItemContentProps, useTreeItem } from "@mui/lab";
import { Session, ProjectInfo, SubProject, SubProjectColumnCards, Card, User, init_proflow_client } from "../../client"
import Pages from "../../pages";
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ProFlow } from '../../proflow';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FaceIcon from '@mui/icons-material/Face';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Result, Err, Ok } from "ts-results";
import clsx from 'clsx';


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
			<Divider></Divider>
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

interface RenderedNoteProps {
	card: Card;
	onEditCard: (card: Card) => void;
	onDeleteCard: (card: Card) => void;
	ref?: React.MutableRefObject<HTMLDivElement>,
}

function RenderedNoteCard(props: RenderedNoteProps) {
	return <div ref={props.ref} style={{ backgroundColor: "white", padding: "5pt", marginTop: "10pt", borderRadius: "10px" }}>
		<h3 style={{ marginLeft: "2pt", marginTop: "2pt" }}>{props.card.title}</h3>
		<Divider sx={{ marginTop: "8pt" }} />
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
		<Divider sx={{ marginTop: "8pt" }} />
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

const SubprojectContent = React.forwardRef(function SubprojectContent(
	props: TreeItemContentProps,
	ref
) {
	const {
		classes,
		className,
		label,
		nodeId,
		icon: iconProp,
		expansionIcon,
		displayIcon,
		onContextMenu,
	} = props;

	const {
		disabled,
		expanded,
		selected,
		focused,
		handleExpansion,
		handleSelection,
		preventSelection,
	} = useTreeItem(nodeId);

	const icon = iconProp || expansionIcon || displayIcon;

	const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		preventSelection(event);
	};

	const handleExpansionClick = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		handleExpansion(event);
	};

	const handleSelectionClick = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		handleSelection(event);
	};


	return (
		<div
			className={clsx(className, classes.root, {
				[classes.expanded]: expanded,
				[classes.selected]: selected,
				[classes.focused]: focused,
				[classes.disabled]: disabled,
			})}
			onMouseDown={handleMouseDown}
			ref={ref as React.Ref<HTMLDivElement>}
			onContextMenu={onContextMenu}
		>
			<div onClick={handleExpansionClick} className={classes.iconContainer}>
				{icon}
			</div>
			<Typography
				onClick={handleSelectionClick}
				component="div"
				className={classes.label}
			>
				{label}
			</Typography>
		</div>
	);
})

interface SubProjectTreeItemProps {
	onOpenContextMenu: (subProjectGuid: string, mouseX: number, mouseY: number) => void;
	subProject: SubProject
}
const SubProjectTreeItem = (props: SubProjectTreeItemProps) => {

	return <TreeItem
		nodeId={props.subProject.guid}
		label={props.subProject.name}
		ContentComponent={SubprojectContent}
		ContentProps={{
			onContextMenu: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
				event.preventDefault();
				event.stopPropagation();
				props.onOpenContextMenu(props.subProject.guid, event.clientX, event.clientY)
			},
		} as any}>
		{props.subProject.children.map(sp =>
			<SubProjectTreeItem key={sp.guid} subProject={sp} onOpenContextMenu={props.onOpenContextMenu} />
		)}
	</TreeItem>
}


interface SubProjectTreeProps {
	project: ProjectInfo;
	selected: string | undefined;
	onSelect: (guid: string) => void,
	onCreateSubProject: (parent: string, name: string) => void,
	onDeleteSubProject: (guid: string) => void,
}

const SubProjectTree = (props: SubProjectTreeProps) => {
	const [editGuid, setEditGuid] = useState<string | undefined>(undefined);
	const [editMouse, setEditMouse] = useState<{ x: number, y: number } | undefined>(undefined);
	const [newSubProject, setNewSubProject] = useState<string | undefined>(undefined);
	const closeMenu = () => {
		setEditMouse(undefined);
	}

	return <>
		<Menu
			open={editMouse != undefined}
			onClose={closeMenu}
			anchorReference="anchorPosition"
			anchorPosition={editMouse ? { top: editMouse.y, left: editMouse.x } : undefined}
		>
			<MenuItem onClick={() => {
				closeMenu();
				setNewSubProject("");
			}}>Add Child</MenuItem>
			<MenuItem onClick={() => {
				closeMenu()
				if (editGuid) {
					props.onDeleteSubProject(editGuid);
				}
				setEditGuid(undefined);
			}}>Delete</MenuItem>
		</Menu>
		<Dialog open={newSubProject != undefined}>
			<DialogTitle>New Sub Project</DialogTitle>
			<DialogContent>
				<TextField autoFocus value={newSubProject} onChange={e => setNewSubProject(e.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={() => {
					if (!editGuid || !newSubProject)
						return;

					props.onCreateSubProject(editGuid, newSubProject)
					setEditGuid(undefined);
					setNewSubProject(undefined)
				}}>Create</Button>
				<Button onClick={() => {
					setEditGuid(undefined);
					setNewSubProject(undefined)
				}}>Cancel</Button>
			</DialogActions>
		</Dialog>
		<TreeView
			aria-label="sub project navigator"
			defaultCollapseIcon={<ExpandMoreIcon />}
			defaultExpandIcon={<ChevronRightIcon />}
			sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
			selected={props.selected}
			onNodeSelect={(_: React.SyntheticEvent, guid: string) => props.onSelect(guid)}
		>
			{props.project.sub_projects.map(sp =>
				<SubProjectTreeItem key={sp.guid} subProject={sp} onOpenContextMenu={(guid, x, y) => {
					setEditGuid(guid);
					setEditMouse({ x, y })
				}} />)
			}
		</TreeView>
	</>
}

export default function ProjectView(props: ProjectViewProps) {
	const { guid } = useParams();
	const navigate = useNavigate();
	const [projInfo, setProjInfo] = useState<ProjectInfo | undefined>(undefined);
	const [currentSubProject, setCurrentSubProject] = useState<SubProject | undefined>(undefined);
	const [cards, setCards] = useState<SubProjectColumnCards | undefined>(undefined);
	const [newColumnName, setNewColumnName] = useState<string>("");
	const [searchCardTitle, setSearchCardTitle] = useState<string>("");
	const [editPopup, setEditPopup] = useState<EditPopup | undefined>();
	const [searchAssignee, setSearchAssignee] = useState<User | undefined>(undefined)
	const [showProgress, setShowProgress] = useState<boolean>(false);
	const [popupError, setPopupError] = useState<string | undefined>(undefined);

	const [showAppDrawer, setShowAppDrawer] = useState<boolean>(true);

	const [menuMouse, setMenuMouse] = useState<{ x: number, y: number } | undefined>(undefined);
	const [newSubProject, setNewSubProject] = useState<string | undefined>(undefined);

	const handleCloseDrag = (_?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setPopupError(undefined);
	};

	const fetchProjectInfo = async (newInfo?: { newCurrentSubProject?: SubProject, clearSearchFilter?: boolean, assigneeFilter?: string }) => {
		if (!guid || !props.session)
			return;

		const res = await props.session.get_project_info(guid);
		if (res.err) {
			setPopupError(res.val);
			return;
		}
		const proj_info = res.val;
		setProjInfo(proj_info);

		let sub_proj = newInfo?.newCurrentSubProject ?? currentSubProject;
		if (!currentSubProject && proj_info.sub_projects.length > 0) {
			sub_proj = proj_info.sub_projects[0];
			setCurrentSubProject(sub_proj);
		}

		if (sub_proj) {
			const filter = (newInfo?.clearSearchFilter ?? false) ? undefined : searchCardTitle;

			let assignee = newInfo?.assigneeFilter ?? searchAssignee?.guid;
			if (assignee == "ALL") {
				assignee = undefined;
			}

			const res = await props.session.get_sub_project_cards(proj_info, sub_proj.guid, assignee, filter);
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

	const get_sub_project_with_guid = (guid: string, current?: SubProject): SubProject | undefined => {
		if (!projInfo)
			return undefined;

		if (current?.guid === guid)
			return current;

		let children = current?.children ?? projInfo.sub_projects;

		for (const child of children) {
			const res = get_sub_project_with_guid(guid, child);
			if (res)
				return res;
		}
		return undefined;
	}

	const closeMenu = () => {
		setMenuMouse(undefined);
	}

	return (
		<DndProvider backend={HTML5Backend}>
			{showProgress &&
				<LinearProgress sx={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }} color="primary" />}
			<Menu
				open={menuMouse != undefined}
				onClose={closeMenu}
				anchorReference="anchorPosition"
				anchorPosition={menuMouse ? { top: menuMouse.y, left: menuMouse.x } : undefined}
			>
				<MenuItem onClick={() => {
					closeMenu();
					setNewSubProject("");
				}}>Create Sub-Project</MenuItem>
			</Menu>
			<Dialog open={newSubProject != undefined}>
				<DialogTitle>New Sub Project</DialogTitle>
				<DialogContent>
					<TextField autoFocus value={newSubProject} onChange={e => setNewSubProject(e.target.value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={async () => {
						if (!newSubProject)
							return;

						if (!props.session || !guid) {
							return;
						}

						setMenuMouse(undefined);

						setShowProgress(true);
						const res = await props.session.create_sub_project(guid, newSubProject);
						setNewSubProject(undefined)
						if (res.err) {
							setPopupError(res.val);
							return;
						}

						setPopupError(undefined);

						await fetchProjectInfo();
						setShowProgress(false);
					}}>Create</Button>
					<Button onClick={() => {
						setMenuMouse(undefined);
						setNewSubProject(undefined)
					}}>Cancel</Button>
				</DialogActions>
			</Dialog>
			<Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "row" }}>
				<Drawer sx={{
					width: showAppDrawer ? "200pt" : "0pt",
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: "200pt",
						boxSizing: 'border-box',
						backgroundColor: "#ececec",
					},
				}} color="#ececec" variant="persistent" anchor="left" open={showAppDrawer} onContextMenu={e => {
					e.preventDefault();
					setMenuMouse({ x: e.clientX, y: e.clientY })
				}}>
					<div style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between"
					}}>
						<Button onClick={() => navigate(Pages.USER)}>View Other projects</Button>
						<IconButton sx={{
							width: "fit-content",
							padding: "10pt",
						}} onClick={() => setShowAppDrawer(false)}>
							<ChevronLeftIcon />
						</IconButton>
					</div>
					<Divider />
					<Divider>
						<Typography style={{ marginBottom: "10pt", marginTop: "20pt" }}>Search for Card Title</Typography>
						<div style={{ marginTop: "5pt", marginBottom: "5pt", display: 'flex', flexDirection: 'column', width: "180pt" }}>
							<TextField label="Card Title to Search" onChange={e => setSearchCardTitle(e.target.value)} value={searchCardTitle} />
							<div style={{ flexDirection: 'row' }}>
								<Button onClick={async () => {
									setShowProgress(true);
									await fetchProjectInfo();
									setShowProgress(false);
								}}>Search</Button>
								<Button style={{}} onClick={async () => {
									setSearchCardTitle("");
									setShowProgress(true);
									await fetchProjectInfo({ clearSearchFilter: true });
									setShowProgress(false);
								}}>Clear</Button>
							</div>
						</div>
					</Divider>
					<Divider>
						<Typography style={{ marginBottom: "10pt" }}>Search for Assignees</Typography>
						<FormControl
							fullWidth>
							<InputLabel id="select-assignee">Assignee</InputLabel>
							<Select
								value={searchAssignee?.guid ?? "ALL"}
								labelId="select-assignee"
								label="Assignee"
								sx={{ marginTop: "0pt", marginBottom: "20pt", width: "180pt" }}
								onChange={async e => {
									const assignee = projInfo.members.find(user => user.guid == e.target.value);
									setSearchAssignee(assignee)
									setShowProgress(true);
									await fetchProjectInfo({ assigneeFilter: e.target.value });
									setShowProgress(false);
								}}>
								<MenuItem value={"ALL"}>All</MenuItem>
								{projInfo.members.map(user => <MenuItem key={user.guid} value={user.guid}>{user.email}</MenuItem>)}
							</Select>
						</FormControl>
					</Divider>
					<SubProjectTree
						project={projInfo}
						selected={currentSubProject?.guid}
						onCreateSubProject={async (parent, name) => {
							if (!props.session || !guid) {
								return;
							}

							setShowProgress(true);
							const res = await props.session.create_sub_project(guid, name, parent);
							if (res.err) {
								setPopupError(res.val);
								return;
							}

							setPopupError(undefined);

							await fetchProjectInfo();
							setShowProgress(false);
						}}
						onSelect={async guid => {
							const newCurrentSubProject = get_sub_project_with_guid(guid);
							setCurrentSubProject(newCurrentSubProject);
							setShowProgress(true);
							await fetchProjectInfo({ newCurrentSubProject });
							setShowProgress(false);
						}}
						onDeleteSubProject={async guid => {
							if (!props.session || !guid) {
								return;
							}

							setShowProgress(true);
							const res = await props.session.delete_sub_project(guid);
							if (res.err) {
								setPopupError(res.val);
								return;
							}

							setPopupError(undefined);

							setCurrentSubProject(undefined);
							await fetchProjectInfo();
							setShowProgress(false);
						}}
					/>

				</Drawer>
				<div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
					<div style={{
						height: "50pt",
						width: "min-content",
						backgroundColor: "#ececec",
						marginTop: "max(1vh, 5pt)",
						marginLeft: "30pt",
						borderRadius: "10px",
						paddingLeft: "30pt",
						paddingRight: "30pt",
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "start",
					}}>
						<IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => setShowAppDrawer(!showAppDrawer)}>
							<MenuIcon />
						</IconButton>
						<h2 style={{ fontSize: "2.2em", whiteSpace: "nowrap", marginRight: "30pt" }}>{projInfo.name}</h2>
						<Tooltip title={projInfo.members.length + " members"}>
							<PeopleIcon></PeopleIcon>
						</Tooltip>
					</div>
					{popupBox()}
					{currentSubProject &&
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
										if (!props.session || !guid || !currentSubProject) {
											setPopupError("Unknown error!");
											return;
										}

										// TODO(Brandon): Before we even make the request, we should probably do some client-side prediction so that it feels less laggy...

										setShowProgress(true);
										const res = await props.session.edit_sub_project_card(currentSubProject.guid, card.guid, { to_priority, to_column });
										if (res.err) {
											setPopupError(res.val);
											return;
										}

										setPopupError(undefined);

										await fetchProjectInfo();
										setShowProgress(false);
									}}
									onEditCard={card => setEditPopup({
										title: card.title,
										description: card.description,
										assignee: card.assignee,
										cardGuid: card.guid,
										showProgress: false
									})}
									onDeleteCard={async card => {
										if (!props.session || !guid || !currentSubProject) {
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

										await fetchProjectInfo(undefined);
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
							<div className=''>
								<div style={{
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
									<TextField label="Column Name" onChange={e => setNewColumnName(e.target.value)} value={newColumnName} />
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
									}}>Create Column</Button>
								</div>
							</div>
						</div>
					}
					{!currentSubProject &&
						<div style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%"
						}}>
							<div style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								flexDirection: "column"
							}}>
								<h3>Create a Sub-Project to begin working with ProFlow!</h3>
								<h4>(Right click the side-panel)</h4>
							</div>
						</div>}
					<Snackbar open={popupError != undefined} autoHideDuration={6000} onClose={handleCloseDrag}>
						<Alert onClose={handleCloseDrag} severity="error" sx={{ width: '100%' }}>
							{popupError}
						</Alert>
					</Snackbar>
				</div>
			</Box>
		</DndProvider>
	);
}
