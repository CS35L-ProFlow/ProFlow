import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Generated, Tree, TreeChildren, TreeParent, ManyToMany, JoinColumn, JoinTable } from "typeorm"

@Entity("user")
export class User {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	ROWID: number;

	@Column({ type: "text" })
	@Generated("uuid")
	guid: string;

	@Column({ type: "longtext" })
	email: string;

	@Column({ type: "text" })
	password: string;

	@OneToMany(() => Card, (card) => card.assignee, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	assigned: Card[];

	@OneToMany(() => Project, (project) => project.owner, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	owned_projects: Project[]

	@ManyToMany(() => Project, (project) => project.members, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinTable({
		name: "user_project_join",
		joinColumns: [{ name: "user_id" }],
		inverseJoinColumns: [{ name: "project_id" }]
	})
	projects: Project[]

	@OneToMany(() => UserInvite, (invite) => invite.invitee, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	invites: UserInvite[];
}



@Entity("project")
// @Tree("materialized-path")
export class Project {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	ROWID: number;

	@Column()
	@Generated("uuid")
	guid: string;

	@Column({ type: "text" })
	name: string;

	// @TreeChildren()
	// children: Project[]

	// @TreeParent({ onDelete: "CASCADE" })
	// parent: Project

	@OneToMany(() => Card, (card) => card.project, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	cards: Card[];

	@ManyToOne(() => User, (user) => user.owned_projects, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "owner_id" })
	owner: User

	@ManyToMany(() => User, (user) => user.projects, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinTable({
		name: "user_project_join",
		joinColumns: [{ name: "project_id" }],
		inverseJoinColumns: [{ name: "user_id" }],
	})
	members: User[]
}

@Entity("invite")
export class UserInvite {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	ROWID: number;

	@Column()
	@Generated("uuid")
	guid: string;

	@ManyToOne(() => User, (user) => user.invites, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "invitee_id" })
	invitee: User;

	@ManyToOne(() => Project, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "project_id" })
	project: Project;
}

@Entity("card")
export class Card {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	ROWID: number;

	@Column({ type: "text" })
	@Generated("uuid")
	guid: string;

	@Column({ type: "text" })
	title: string;

	@ManyToOne(() => Project, (project) => project.cards, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "project_id" })
	project: Project;

	@ManyToOne(() => User, (user) => user.assigned, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "assignee_id" })
	assignee?: User;

	@Column({ type: "text" })
	description: string;

	@Column({ type: "date" })
	date_created: Date;

	@Column({ type: "date" })
	date_modified: Date;

	@Column({ type: "text" })
	list: string;

	@Column({ type: "int" })
	priority: number;
}

