import { Role } from "./Role";

export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    creationDate: string;
    password?: string; // Password might not always be returned
    roleIds?: number[]|null
    roles?: Role[]|null
    isActive?:boolean
}

