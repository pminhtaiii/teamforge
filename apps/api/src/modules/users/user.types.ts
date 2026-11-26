export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface CreateUserInput {
    name: string;
    email: string;
    passwordHash: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResult {
    user: PublicUser;
    accessToken: string;
}

export type PublicUser = Omit<User, "passwordHash">