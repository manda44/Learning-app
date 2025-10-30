import { getCourseList } from "../../services/courseService";
import { getChaptersByCourseId, createChapter, getChapterById, updateChapter } from "../../services/chapterService";

export function useChapterAction({state}){
    const {
        setCourseList,showStatusModal,
        setChapterList,isUpdating,form,
        close,selectedValue,open,setIsUpdating
    } = state;
    async function fetchCourses(){
        try {
            const response = await getCourseList();
            setCourseList(response);
        }
        catch{
            showStatusModal('error', 'Une erreur est survenue lors de l\'operation')
        }
    }
    async function fetchChapters(courseId : number){
        try{
            const response = await getChaptersByCourseId(courseId);
            setChapterList(response);
        }
        catch{ showStatusModal('error', 'Une erreur est survenue lors de l\'operation')}
    }
    const handleClose = () => {
        if (isUpdating)
            form.reset();
        close();
    };
    
    async function onSubmitForm(values: any) {
        try {
            if (!selectedValue) {
                showStatusModal('error', 'Veuillez sélectionner un cours');
                return;
            }
            
            const chapterData = {
                title: values.title,
                description: values.description,
                order_: 1, // You might want to calculate this based on existing chapters
                courseId: Number(selectedValue),
                color:values.color,
                chapterId: values.chapterId
            };
            
            if (!isUpdating) {
                await createChapter(chapterData);
                showStatusModal('success', 'Chapitre créé avec succès');
            }
            else{
                await updateChapter(values.chapterId,chapterData),
                showStatusModal('success', 'Chapitre modifié avec succès');
            }
            form.reset();
            close();
            
            // Refresh the chapter list
            await fetchChapters(Number(selectedValue));
        } catch (error) {
            showStatusModal('error', 'Une erreur est survenue lors de la création du chapitre');
        }
    }

    async function openEditModal(chapterId: number) {
        try {
            const chapter = await getChapterById(chapterId);
            form.setValues({
                title: chapter.title,
                description: chapter.description || '',
                color: chapter.color || '#ffffff',
                chapterId: chapterId
            });
            setIsUpdating(true);
            open();
        } catch (error) {
            console.log(error);
            showStatusModal('error', 'Erreur lors de la récupération du chapitre');
        }
    }

    return {
        fetchCourses,
        fetchChapters,
        handleClose,
        onSubmitForm,
        openEditModal
    }
}