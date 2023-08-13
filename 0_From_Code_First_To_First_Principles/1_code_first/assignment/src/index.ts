import 'dotenv';
import Express from 'express';

import { User } from "./models/User"
import { myDataSource } from "./app-data-source"

// establish database connection
myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err: unknown) => {
        console.error("Error during Data Source initialization:", err)
    })

const app = Express();

app.get('/', async (req, res) => {
    const users = await myDataSource.getRepository(User).find()
    res.json(users)
});

app.listen(3000, () => {
	console.log('Server started on port 3000');
});