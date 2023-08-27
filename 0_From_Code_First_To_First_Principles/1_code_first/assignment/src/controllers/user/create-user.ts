import { Request, Response } from "express";
import { ZodError, z } from "zod";

import { myDataSource } from "../../app-data-source";
import { User } from "../../models/User";
import { ServerErrors } from "../../common/errors";

const CreateUserSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
    email: z.string().email().max(255),
    firstName: z.string().max(255),
    lastName: z.string().max(255),
});

const CreateUserErrors = {
	UsernameAlreadyTaken: 'UsernameAlreadyTaken',
	EmailAlreadyInUse: 'EmailAlreadyInUse',
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, email, firstName, lastName } = CreateUserSchema.parse(req.body);

        const existingUser = await myDataSource.getRepository(User).findOne({ where: [{ username }, { email }] });

        if (existingUser) {
            const error = existingUser.username === username ? CreateUserErrors.UsernameAlreadyTaken : CreateUserErrors.EmailAlreadyInUse;
            res.status(409).json({ error, data: undefined, success: false });
            return;
        }

        const user = new User()
        user.username = username
        user.password = password
        user.email = email
        user.firstName = firstName
        user.lastName = lastName
        await myDataSource.getRepository(User).save(user)
		
        res.status(201).json({ error: undefined, data: { id: user.id, email, username, firstName, lastName }, success: true })
    } catch (err) {
        console.error(JSON.stringify(err, null, 4))
        
        if (err instanceof ZodError) {
        	res.status(400).json({ error: ServerErrors.ValidationError, data: undefined, success: false })
		} else {
			res.status(500).json({ error: ServerErrors.UnknownError, data: undefined, success: false })
		}
    }
}