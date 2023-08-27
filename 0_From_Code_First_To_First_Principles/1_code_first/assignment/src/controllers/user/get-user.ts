import { Request, Response } from "express";
import { ZodError, z } from "zod";

import { myDataSource } from "../../app-data-source";
import { User } from "../../models/User";
import { ServerErrors } from "../../common/errors";

const SearchUserSchema = z.object({
    email: z.string().email().max(255).optional(),
});

const GetUserErrors = {
	UserNotFound: 'UserNotFound',
	ValidationError: 'ValidationError',
}

export const getUser = async (req: Request<{}, {}, { email?: string}>, res: Response) => {
    try {
        const { email } = SearchUserSchema.parse(req.query);

        const existingUser = await myDataSource.getRepository(User).findOne({ where: [{ email }] });
        if (!existingUser) {
            res.status(404).json({ error: GetUserErrors.UserNotFound, data: undefined, success: false });
			return;
        }

		const { id, username, firstName, lastName } = existingUser;
		res.status(200).json({ error: undefined, data: { id, email, username, firstName, lastName }, success: true });
    } catch (err) {
        console.error(err)
        if (err instanceof ZodError) {
        	res.status(400).json({ error: GetUserErrors.ValidationError, data: undefined, success: false })
		} else {
			res.status(500).json({ error: ServerErrors.UnknownError, data: undefined, success: false })
		}
    }
}