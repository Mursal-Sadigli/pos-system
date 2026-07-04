import bcrypt from 'bcryptjs';

const SALT_ROUNDS=10;

//Hash password
export const hashPassword=async(password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare passwort with hash
export const comparePassword=async(password: string, hashPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
};