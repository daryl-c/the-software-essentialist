import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "postgres",
    host: "db",
    port: 5432,
    username: "postgres",
    password: "password1234",
    database: "ddd",
    entities: ["src/models/*.ts"],
    logging: true,
    synchronize: process.env.NODE_ENV !== "production",
})