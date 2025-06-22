import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const create = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', message: (err as Error).message });
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', message: (err as Error).message });
  }
};
