import { prisma } from '../db/prisma.js';

class UserRepository {
  async findByLogin(login: string) {
    return prisma.user.findUnique({
      where: { login },
      select: { id: true, login: true, passwordHash: true, role: true },
    });
  }
}

export const userRepository = new UserRepository();
