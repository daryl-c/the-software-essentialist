import 'dotenv';
import Express from 'express';
import bodyParser from 'body-parser';

import { myDataSource } from "./app-data-source"

import { createUser } from "./controllers/user/create-user"
import { editUser } from './controllers/user/edit-user';
import { getUser } from './controllers/user/get-user';

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
app.use(bodyParser.json());

app.post('/users/new', createUser);
app.post('/users/edit/:userId', editUser);
app.get('/users', getUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});