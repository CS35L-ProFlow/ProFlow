import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Generated, Tree, TreeChildren, TreeParent, ManyToMany } from "typeorm"

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

	@OneToMany(() => Card, (card) => card.assignee)
	assigned: Card[];

	@OneToMany(() => Project, (project) => project.owner)
	owned_projects: Project[]

	@ManyToMany(() => Project, (project) => project.members)
	projects: Project[]

	@OneToMany(() => UserInvite, (invite) => invite.invitee)
	invites: UserInvite[];

	@OneToMany(() => UserInvite, (invite) => invite.inviter)
	outgoing_invites: UserInvite[];
}

@Entity("invite")
export class UserInvite {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	ROWID: number;

	@Column()
	@Generated("uuid")
	guid: string;

	@ManyToOne(() => User, (user) => user.invites)
	invitee: User;

	@ManyToOne(() => User, (user) => user.outgoing_invites)
	inviter: User;
}

@Entity("project")
@Tree("materialized-path")
export class Project {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	ROWID: number;

	@Column()
	@Generated("uuid")
	guid: string;

	@Column({ type: "text" })
	name: string;

	@OneToMany(() => Card, (card) => card.project)
	cards: Card[];

	@ManyToOne(() => User, (user) => user.owned_projects)
	owner: User

	@ManyToMany(() => User, (user) => user.projects)
	members: User[]

	@Column({ type: "text" })
	lists: string[];

	@TreeChildren()
	children: Project[]

	@TreeParent()
	parent: Project
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

	@ManyToOne(() => Project, (project) => project.cards)
	project: Project;

	@ManyToOne(() => User, (user) => user.assigned, { nullable: true })
	assignee?: User;

	@Column({ type: "text" })
	description: string;

	@Column({ type: "date" })
	date_created: Date;

	@Column({ type: "text" })
	list: string;

	@Column({ type: "int" })
	priority: number;
}

