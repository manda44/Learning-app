import apiClient from "./apiClient";
import type {Course} from "../types/Course";
import { COURSE_ENDPOINT } from "../constants/api";

export const getCourseList = async function() : Promise<Course[]>{
      try{
            const response = await apiClient.get<Course[]>(COURSE_ENDPOINT);
            return response.data;
      }catch(error){
            console.error('Error fetching courses', error);
            throw error;
      }
};

export const getCourseById = async function(courseId: number): Promise<Course> {
    try {
        const response = await apiClient.get<Course>(`${COURSE_ENDPOINT}/${courseId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching course with id ${courseId}`, error);
        throw error;
    }
};

export const searchCourse = async function (query: string): Promise<Course[]> {
    try {
        const response = await apiClient.get<Course[]>(`${COURSE_ENDPOINT}/search?q=${query}`);
        return response.data;

    }
    catch (error) {
        console.error(`Error searching course with query '${query}'`, error);
        throw error;
    }
}

export const createCourse = async function(courseData: { title: string, description: string }): Promise<Course> {
    try {
        const response = await apiClient.post<Course>(COURSE_ENDPOINT, courseData);
        return response.data;
    } catch (error) {
        console.error('Error creating course', error);
        throw error;
    }
};

export const updateCourse = async function(courseId: number, courseData: Partial<Course>): Promise<Course> {
    try {
        const response = await apiClient.put<Course>(`${COURSE_ENDPOINT}/${courseId}`, courseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating course with id ${courseId}`, error);
        throw error;
    }
};

export const deleteCourse = async function(courseId: number): Promise<void> {
    try {
        await apiClient.delete(`${COURSE_ENDPOINT}/${courseId}`);
    } catch (error) {
        console.error(`Error deleting course with id ${courseId}`, error);
        throw error;
    }
};

