import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm"

@Unique(["email", "username"])
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string

    @Column()
    username: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    password: string
}