import apiClient from "./apiClient";
import type {User} from "../types/User";
import { USER_ENDPOINT } from "../constants/api";

export const getUserList = async function() : Promise<User[]>{
      try{
            const response = await apiClient.get<User[]>(USER_ENDPOINT);
            return response.data;
      }catch(error){
            console.error('Error fetching users', error);
            throw error;
      }
};

export const getUserById = async function(userId: number): Promise<User> {
    try {
        const response = await apiClient.get<User>(`${USER_ENDPOINT}/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with id ${userId}`, error);
        throw error;
    }
};

export const searchUser = async function (query: string): Promise<User[]> {
    try {
        const response = await apiClient.get<User[]>(`${USER_ENDPOINT}/search?q=${query}`);
        return response.data;

    }
    catch (error) {
        console.error(`Error searching user with query '${query}'`, error);
        throw error;
    }
}

export const createUser = async function(userData: { FirstName: string, LastName: string, Email: string, Password?: string,roleIds?:number[]|null }): Promise<User> {
    try {
        const response = await apiClient.post<User>(USER_ENDPOINT, userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user', error);
        throw error;
    }
};

export const searchUsers = async function (query: string): Promise<User[]> {
    try {
        const response = await apiClient.get<User[]>(`${USER_ENDPOINT}/search?query=${query}`);
        return response.data;
    }
    catch (error) {
        console.error(`Error searching user with query '${query}'`, error);
        throw error;
    }
}

export const updateUser = async function(userId: number, userData: Partial<User>): Promise<User> {
    try {
        const response = await apiClient.put<User>(`${USER_ENDPOINT}/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Error updating user with id ${userId}`, error);
        throw error;
    }
};

export const disableUser = async function (userId: number): Promise<User> {
  try {
    const response = await apiClient.post<User>(`${USER_ENDPOINT}/disable/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error disabling user with id ${userId}`, error);
    throw error;
  }
};

export const enableUser = async function (userId: number): Promise<User> {
  try {
    const response = await apiClient.post<User>(`${USER_ENDPOINT}/enable/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error enabling user with id ${userId}`, error);
    throw error;
  }
};

export const deleteUser = async function(userId: number): Promise<void> {
    try {
        await apiClient.delete(`${USER_ENDPOINT}/${userId}`);
    } catch (error) {
        console.error(`Error deleting user with id ${userId}`, error);
        throw error;
    }
};