// services/auth.ts
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { TDatabaseConnection } from '../db/connection';

export class AuthService {
  constructor(private db: TDatabaseConnection) {}

  /**
   * Полноценный логин по username и паролю
   */
  async login(username: string, password: string) {
    // 1. Находим пользователя по username

    let realDB = await this.db;

    const user = await realDB.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Сравниваем хэш пароля
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Генерируем JWT
    const token = sign(
      {
        sub: user.id,
        v: user.tokenVersion,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }
}
