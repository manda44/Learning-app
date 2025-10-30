import apiClient from "./apiClient";
import type { Content } from "../types/Content";
import { API_URL } from "../constants/api";
import type { Chapter } from "../types/Chapter";

const CONTENT_ENDPOINT = `${API_URL}/contents`;
const CHAPTER_ENDPOINT = `${API_URL}/chapters`;

export const getContentList = async function(): Promise<Content[]> {
    try {
        const response = await apiClient.get<Content[]>(CONTENT_ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error fetching contents', error);
        throw error;
    }
};

export const getContentById = async function(contentId: number): Promise<Content> {
    try {
        const response = await apiClient.get<Content>(`${CONTENT_ENDPOINT}/${contentId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching content with id ${contentId}`, error);
        throw error;
    }
};

export const getContentsByChapterId = async function(chapterId: number): Promise<Content> {
    try {
        const response = await apiClient.get<Content>(`${CONTENT_ENDPOINT}/chapter/${chapterId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching contents for chapter ${chapterId}`, error);
        throw error;
    }
};

export const getAllChaptersWithSameCourse = async function(chapterId: number): Promise<Chapter[]>{
    try{
        const response = await apiClient.get<Chapter[]>(`${CHAPTER_ENDPOINT}/courseChapters/${chapterId}`);
        return response.data;
    }catch(error){
        console.error(`Error fetching course chapters with same for courseId for ${chapterId}`, error);
        throw error;
    }
}

export const searchContent = async function(query: string): Promise<Content[]> {
    try {
        const response = await apiClient.get<Content[]>(`${CONTENT_ENDPOINT}/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error(`Error searching content with query '${query}'`, error);
        throw error;
    }
};

export const createContent = async function(contentData: { 
    chapterId: number,
    data: any 
}): Promise<Content> {
    try {
        const response = await apiClient.post<Content>(CONTENT_ENDPOINT, contentData);
        return response.data;
    } catch (error) {
        console.error('Error creating content', error);
        throw error;
    }
};

export const updateContent = async function(contentId: number, contentData: Partial<Content>): Promise<Content> {
    try {
        const response = await apiClient.put<Content>(`${CONTENT_ENDPOINT}/${contentId}`, contentData);
        return response.data;
    } catch (error) {
        console.error(`Error updating content with id ${contentId}`, error);
        throw error;
    }
};

export const deleteContent = async function(contentId: number): Promise<void> {
    try {
        await apiClient.delete(`${CONTENT_ENDPOINT}/${contentId}`);
    } catch (error) {
        console.error(`Error deleting content with id ${contentId}`, error);
        throw error;
    }
};
