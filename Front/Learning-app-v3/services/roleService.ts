import apiClient from "./apiClient";
import type {Role} from "../types/Role";
import { ROLE_ENDPOINT } from "../constants/api";

export const getRoleList = async function() : Promise<Role[]>{
      try{
            const response = await apiClient.get<Role[]>(ROLE_ENDPOINT);
            return response.data;
      }catch(error){
            console.error('Error fetching roles', error);
            throw error;
      }
};

export const getRoleById = async function(roleId: number): Promise<Role> {
    try {
        const response = await apiClient.get<Role>(`${ROLE_ENDPOINT}/${roleId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching role with id ${roleId}`, error);
        throw error;
    }
};

export const createRole = async function(roleData: { Name: string }): Promise<Role> {
    try {
        const response = await apiClient.post<Role>(ROLE_ENDPOINT, roleData);
        return response.data;
    } catch (error) {
        console.error('Error creating role', error);
        throw error;
    }
};

export const updateRole = async function(roleId: number, roleData: Partial<Role>): Promise<Role> {
    try {
        const response = await apiClient.put<Role>(`${ROLE_ENDPOINT}/${roleId}`, roleData);
        return response.data;
    } catch (error) {
        console.error(`Error updating role with id ${roleId}`, error);
        throw error;
    }
};

export const deleteRole = async function(roleId: number): Promise<void> {
    try {
        await apiClient.delete(`${ROLE_ENDPOINT}/${roleId}`);
    } catch (error) {
        console.error(`Error deleting role with id ${roleId}`, error);
        throw error;
    }
};
