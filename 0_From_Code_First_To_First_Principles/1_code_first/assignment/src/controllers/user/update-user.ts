import { Request, Response } from "express";
import { ZodError, z } from "zod";

import { myDataSource } from "../../app-data-source";
import { User } from "../../models/User";
import { ServerErrors } from "../../common/errors";

const UpdateUserSchema = z.object({
	id: z.coerce.number().int().positive(),
    username: z.string().min(3).max(255),
    email: z.string().email().max(255),
    firstName: z.string().max(255),
    lastName: z.string().max(255),
});

const UpdateUserErrorTypes = {
	UserNotFound: 'UserNotFound',
	EmailAlreadyInUse: 'EmailAlreadyInUse',
	UsernameAlreadyTaken: 'UsernameAlreadyTaken',
	ValidationError: 'ValidationError',
}

export const updateUser = async (req: Request<{userId: string}>, res: Response) => {
    try {
        const { id, username, email, firstName, lastName } = UpdateUserSchema.parse({ id: req.params.userId, ...req.body });
		
		const existingUser = await myDataSource.getRepository(User).findOne({ where: { id } });
		if (!existingUser) {
			res.status(404).json({ error: UpdateUserErrorTypes.UserNotFound, data: undefined, success: false });
			return;
		}

		const conflictingUser = await myDataSource.getRepository(User)
			.createQueryBuilder('user')	
			.where('user.id != :id', { id })
			.andWhere('(user.username = :username OR user.email = :email)', { username, email })
			.getOne();

        if (conflictingUser) {
            const error = conflictingUser.username === username 
				? UpdateUserErrorTypes.ValidationError 
				: UpdateUserErrorTypes.EmailAlreadyInUse;
            res.status(409).json({ error, data: undefined, success: false });
            return;
        }

		existingUser.username = username
		existingUser.email = email
		existingUser.firstName = firstName
		existingUser.lastName = lastName
		await myDataSource.getRepository(User).save(existingUser)

		res.status(200).json({ error: undefined, data: { id: existingUser.id, email, username, firstName, lastName }, success: true })
    } catch (err) {
        console.error(err)
		if (err instanceof ZodError) {
        	res.status(400).json({ error: UpdateUserErrorTypes.ValidationError, data: undefined, success: false })
		} else {
			res.status(500).json({ error: ServerErrors.UnknownError, data: undefined, success: false })
		}
    }
}