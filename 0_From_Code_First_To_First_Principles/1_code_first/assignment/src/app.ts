import 'dotenv';
import Express from 'express';
import bodyParser from 'body-parser';

import { createUser } from "./controllers/user/create-user"
import { editUser } from './controllers/user/edit-user';
import { getUser } from './controllers/user/get-user';

const app = Express();
app.use(bodyParser.json());

app.post('/users/new', createUser);
app.post('/users/edit/:userId', editUser);
app.get('/users', getUser);

export { app };