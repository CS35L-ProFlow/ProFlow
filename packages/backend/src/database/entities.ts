import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Generated } from "typeorm"

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

}

@Entity("project")
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

	@Column({ type: "text" })
	lists: string[];
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

