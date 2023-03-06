import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Generated, Tree, TreeChildren, TreeParent, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("user")
export class User {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	readonly ROWID: number;

	@Column({ type: "text" })
	@Generated("uuid")
	readonly guid: string;

	@Column({ type: "longtext" })
	readonly email: string;

	@Column({ type: "text" })
	readonly password: string;

	@OneToMany(() => Card, (card) => card.assignee, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	readonly assigned: Card[];

	@OneToMany(() => Project, (project) => project.owner, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	readonly owned_projects: Project[]

	@ManyToMany(() => Project, (project) => project.members, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinTable({
		name: "user_project_join",
		joinColumns: [{ name: "user_id" }],
		inverseJoinColumns: [{ name: "project_id" }]
	})
	readonly projects: Project[]

	@OneToMany(() => UserInvite, (invite) => invite.invitee, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	readonly invites: UserInvite[];
}

@Entity("project")
export class Project {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	readonly ROWID: number;

	@Column()
	@Generated("uuid")
	readonly guid: string;

	@Column({ type: "text" })
	name: string;

	// These are just the top-level sub-projects. There can be child subprojects of these subprojects...
	@OneToMany(() => SubProject, (sub_project) => sub_project.project, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	readonly sub_projects: SubProject[];

	@OneToMany(() => ProjectColumn, (project_column) => project_column.project, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	project_columns: ProjectColumn[];

	@ManyToOne(() => User, (user) => user.owned_projects, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "owner_id" })
	readonly owner: User

	@ManyToMany(() => User, (user) => user.projects, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinTable({
		name: "user_project_join",
		joinColumns: [{ name: "project_id" }],
		inverseJoinColumns: [{ name: "user_id" }],
	})
	members: User[]
}

@Entity("sub_project")
@Tree("materialized-path")
export class SubProject {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	readonly ROWID: number;

	@Column()
	@Generated("uuid")
	readonly guid: string;

	@Column({ type: "text" })
	name: string;

	@ManyToOne(() => Project, (project) => project.sub_projects, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "project_id" })
	readonly project: Project

	@OneToMany(() => Card, (card) => card.sub_project, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	cards: Card[];

	@TreeChildren({ cascade: true })
	readonly children: SubProject[]

	@TreeParent({ onDelete: "CASCADE" })
	readonly parent?: SubProject
}

@Entity("project_column")
export class ProjectColumn {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	readonly ROWID: number;

	@Column()
	@Generated("uuid")
	readonly guid: string;

	@Column({ type: "text", nullable: false })
	name: string;

	@Column({ type: "int", nullable: false })
	readonly order_index: number;

	@OneToMany(() => Card, (card) => card.project_column, { onDelete: "CASCADE", onUpdate: "CASCADE" })
	readonly cards: Card[];

	@ManyToOne(() => Project, (project) => project.project_columns, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "project_id" })
	readonly project: Project;
}

@Entity("card")
export class Card {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	readonly ROWID: number;

	@Column({ type: "text" })
	@Generated("uuid")
	readonly guid: string;

	@Column({ type: "text" })
	title: string;

	@ManyToOne(() => SubProject, (sub_project) => sub_project.cards, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "sub_project_id" })
	readonly sub_project: SubProject;

	@ManyToOne(() => ProjectColumn, (project_column) => project_column.cards, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "project_column_id" })
	project_column: ProjectColumn

	@ManyToOne(() => User, (user) => user.assigned, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "assignee_id" })
	assignee?: User;

	@Column({ type: "text" })
	description: string;

	@CreateDateColumn()
	readonly date_created: Date;

	@UpdateDateColumn()
	readonly date_modified: Date;

	@Column({ type: "int" })
	priority: number;
}

@Entity("invite")
export class UserInvite {
	@PrimaryGeneratedColumn({ name: "ROWID" })
	readonly ROWID: number;

	@Column()
	@Generated("uuid")
	readonly guid: string;

	@ManyToOne(() => User, (user) => user.invites, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "invitee_id" })
	readonly invitee: User;

	@ManyToOne(() => Project, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
	@JoinColumn({ name: "project_id" })
	readonly project: Project;
}

