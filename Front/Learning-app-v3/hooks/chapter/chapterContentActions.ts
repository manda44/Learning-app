/* eslint-disable */
import { createContent, getContentsByChapterId,getAllChaptersWithSameCourse } from "../../services/contentService";
import { updateChapterTitle } from "../../services/chapterService";
import type { Content } from "../../types/Content";

// @ts-ignore
export default function useChapterContentAction({state}){
    const{
        setContent,
        setChapters
    } = state


    async function fetchContent(chapterId: number){
        try {
            const contents = await getContentsByChapterId(chapterId);
            setContent(contents.data ? JSON.parse(contents.data) : []);
        } catch (error) {
            console.error('Error fetching chapter content:', error);
            throw error;
        }
    }

    async function fetchChapters(chapterId: number){
        const chapters = await getAllChaptersWithSameCourse(chapterId);
        setChapters(chapters);
    }
    
    async function onSaveChapterContent(chapterId: number, content: any){
        try {
            const contentObject: Content = {
                chapterId,
                data: JSON.stringify(content)
            };
            console.log(content);
            const result = await createContent(contentObject);
            return result;
        } catch (error) {
            console.error('Error saving chapter content:', error);
            throw error;
        }
    }

    async function onUpdateChapterTitle(chapterId: number, title: string){
        try {
            await updateChapterTitle(chapterId, title);
        } catch (error) {
            console.error('Error updating chapter title:', error);
            throw error;
        }
    }

    return {
        fetchContent,
        onSaveChapterContent,
        fetchChapters,
        onUpdateChapterTitle
    }
}