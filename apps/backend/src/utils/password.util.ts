import * as bcrypt from 'bcryptjs'

const SALT_ROUND = process.env.PASSWORD_ROUND ? Number(process.env.PASSWORD_ROUND) : 10;

export const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
    return hashedPassword;
}

export const comparePassword = async (
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword)
}