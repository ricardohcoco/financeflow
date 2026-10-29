export type User = {
    id: number;
    name: string;
    email: string;
};

export type RegisterData = {
    name: string;
    email: string;
    password: string;
};

export type LoginData = {
    email: string;
    password: string;
};

export type RegisterResponse = {
    message: string;
    user: User;
};

export type LoginResponse = {
    message: string;
    user: User;
    token: string;
};