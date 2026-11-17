import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User from '../models/User';
import { env } from '../config/env';
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors';
import { LoginInput, RegisterInput } from '../schemas/authSchema';
import { IAuthUser, IUser, UserRole } from '../types';

export class AuthService {
  private generateToken(userId: string | Types.ObjectId, email: string, role: UserRole, name: string): string {
    const payload: IAuthUser = {
      id: userId.toString(),
      email,
      role,
      name
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as unknown as number
    });
  }

  async register(input: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const newUser = await User.create({
      email: input.email,
      password: input.password,
      name: input.name,
      role: input.role || 'creator'
    });

    const token = this.generateToken(newUser._id, newUser.email, newUser.role, newUser.name);

    return {
      user: {
        _id: String(newUser._id),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token
    };
  }

  async login(input: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account has been deactivated');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user._id, user.email, user.role, user.name);

    return {
      user: {
        _id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getCurrentUser(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      _id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}

export const authService = new AuthService();
export default authService;
