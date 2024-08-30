import { HttpException } from '@/errors/httpException';
import prisma from '@/prisma';
import authQuery from '@/queries/authQuery';
import { HttpStatus } from '@/types/error';
import { hashingPassword } from '@/utils/password';
import { generateRandomToken } from '@/utils/randomToken';
import { resetPasswordMail } from '@/utils/sendMail';

class PasswordAction {
  public async resetRequest(email: string) {
    const user = await authQuery.findUserAndIsPassword(email);

    if (!user) {
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Email tidak ditemukan');
    }

    const generate = generateRandomToken(1);

    //   updating resetPasswordToken & resetPasswordTokenExpiry to db then send email to user (atomic)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          resetPasswordToken: generate.token,
          resetPasswordTokenExpiry: new Date(generate.tokenExpiry),
        },
      });

      await resetPasswordMail(email, generate.token);
    });
  }

  public async reset(password: string, token: string) {
    const user = await authQuery.findUserByResetPasswordToken(token);

    // throw error when the returned user is not found or no password
    if (!user || user.password === null)
      throw new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'User tidak ditemukan. Silakan ulangi permintaan atur ulang password',
      );

    const hashedPassword = await hashingPassword(password);

    await authQuery.resetPasswordAndRemoveToken(user.id, hashedPassword);
  }
}

export default new PasswordAction();