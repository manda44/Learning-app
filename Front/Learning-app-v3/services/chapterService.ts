import apiClient from "./apiClient";
import type { Chapter } from "../types/Chapter";
import { API_URL } from "../constants/api";

const CHAPTER_ENDPOINT = `${API_URL}/chapters`;

export const getChapterList = async function(): Promise<Chapter[]> {
    try {
        const response = await apiClient.get<Chapter[]>(CHAPTER_ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error fetching chapters', error);
        throw error;
    }
};

export const getChapterById = async function(chapterId: number): Promise<Chapter> {
    try {
        const response = await apiClient.get<Chapter>(`${CHAPTER_ENDPOINT}/${chapterId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chapter with id ${chapterId}`, error);
        throw error;
    }
};

export const getChaptersByCourseId = async function(courseId: number): Promise<Chapter[]> {
    try {
        const response = await apiClient.get<Chapter[]>(`${CHAPTER_ENDPOINT}/course/${courseId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chapters for course ${courseId}`, error);
        throw error;
    }
};

export const searchChapter = async function(query: string): Promise<Chapter[]> {
    try {
        const response = await apiClient.get<Chapter[]>(`${CHAPTER_ENDPOINT}/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error(`Error searching chapter with query '${query}'`, error);
        throw error;
    }
};

export const createChapter = async function(chapterData: { 
    title: string, 
    description?: string, 
    order_: number,
    courseId: number 
}): Promise<Chapter> {
    try {
        const response = await apiClient.post<Chapter>(CHAPTER_ENDPOINT, chapterData);
        return response.data;
    } catch (error) {
        console.error('Error creating chapter', error);
        throw error;
    }
};

export const updateChapter = async function(chapterId: number, chapterData: Partial<Chapter>): Promise<Chapter> {
    try {
        const response = await apiClient.put<Chapter>(`${CHAPTER_ENDPOINT}/${chapterId}`, chapterData);
        return response.data;
    } catch (error) {
        console.error(`Error updating chapter with id ${chapterId}`, error);
        throw error;
    }
};

export const updateChapterTitle = async function(chapterId: number, title: string): Promise<void> {
    try {
        await apiClient.patch(`${CHAPTER_ENDPOINT}/${chapterId}/title`, { title });
    } catch (error) {
        console.error(`Error updating chapter title for id ${chapterId}`, error);
        throw error;
    }
};

export const deleteChapter = async function(chapterId: number): Promise<void> {
    try {
        await apiClient.delete(`${CHAPTER_ENDPOINT}/${chapterId}`);
    } catch (error) {
        console.error(`Error deleting chapter with id ${chapterId}`, error);
        throw error;
    }
};
