import { Request, Response } from "express";
import { ZodError, z } from "zod";

import { myDataSource } from "../../app-data-source";
import { User } from "../../models/User";
import { ServerErrors } from "../../common/errors";

const EditUserSchema = z.object({
	id: z.coerce.number().int().positive(),
    username: z.string().min(3).max(255),
    email: z.string().email().max(255),
    firstName: z.string().max(255),
    lastName: z.string().max(255),
});

const EditUserErrorTypes = {
	UserNotFound: 'UserNotFound',
	EmailAlreadyInUse: 'EmailAlreadyInUse',
	UsernameAlreadyTaken: 'UsernameAlreadyTaken'
}

export const editUser = async (req: Request<{userId: string}>, res: Response) => {
    try {
        const { id, username, email, firstName, lastName } = EditUserSchema.parse({ id: req.params.userId, ...req.body });
		
		const existingUser = await myDataSource.getRepository(User).findOne({ where: { id } });
		if (!existingUser) {
			res.status(404).json({ error: EditUserErrorTypes.UserNotFound, data: undefined, success: false });
			return;
		}

		const conflictingUser = await myDataSource.getRepository(User)
			.createQueryBuilder('user')	
			.where('user.id != :id', { id })
			.andWhere('(user.username = :username OR user.email = :email)', { username, email })
			.getOne();

        if (conflictingUser) {
            const error = conflictingUser.username === username 
				? EditUserErrorTypes.UsernameAlreadyTaken 
				: EditUserErrorTypes.EmailAlreadyInUse;
            res.status(409).json({ error, data: undefined, success: false });
            return;
        }

		await myDataSource.getRepository(User).update(id, { username, email, firstName, lastName });

		res.status(200).json({ error: undefined, data: { id: existingUser.id, email, username, firstName, lastName }, success: true })
    } catch (err) {
        console.error(JSON.stringify(err, null, 4))
		if (err instanceof ZodError) {
        	res.status(400).json({ error: ServerErrors.ValidationError, data: undefined, success: false })
		} else {
			res.status(500).json({ error: ServerErrors.UnknownError, data: undefined, success: false })
		}
    }
}