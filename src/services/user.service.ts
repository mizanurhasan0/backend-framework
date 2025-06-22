import { User } from '../models/user.model';

export const createUser = async (data: { name: string; email: string; password: string }) => {
  const user = new User(data);
  return await user.save();
};

export const getAllUsers = async () => {
  return await User.find();
};
