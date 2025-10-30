import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { mockChapters, type ExtendedQuiz, type ExtendedQuizCreateDto } from './quizPageStates';
import {createQuiz, deleteQuiz, getQuizList, type QuizCreateDto, updateQuiz} from "../../services/quizService.ts";
import {getCourseList} from "../../services/courseService.ts";
import type {Course} from "../../types/Course.ts";
import {getChaptersByCourseId} from "../../services/chapterService.ts";
import type {Chapter} from "../../types/Chapter.ts";

interface QuizPageActionsProps {
    state: {
        quizzes: ExtendedQuiz[];
        setQuizzes: React.Dispatch<React.SetStateAction<ExtendedQuiz[]>>;
        loading: boolean;
        setLoading: React.Dispatch<React.SetStateAction<boolean>>;
        page: number;
        setPage: React.Dispatch<React.SetStateAction<number>>;
        totalPages: number;
        setTotalPages: React.Dispatch<React.SetStateAction<number>>;
        search: string;
        setSearch: React.Dispatch<React.SetStateAction<string>>;
        selectedQuiz: ExtendedQuiz | null;
        setSelectedQuiz: React.Dispatch<React.SetStateAction<ExtendedQuiz | null>>;
        isUpdating: boolean;
        setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>;
        selectedCourse: string;
        setSelectedCourse: React.Dispatch<React.SetStateAction<string>>;
        availableChapters: Array<{value: string, label: string}>;
        setAvailableChapters: React.Dispatch<React.SetStateAction<Array<{value: string, label: string}>>>;
        activeStep: number;
        setActiveStep: React.Dispatch<React.SetStateAction<number>>;
        mockQuizzes: ExtendedQuiz[];
        courseList: Course[];
        setCourseList: React.Dispatch<React.SetStateAction<Course[]>>;
        showStatusModal: (type: 'success' | 'error' | 'confirm', message: string) => void;
        chapterList: Chapter[];
        setChapterList: React.Dispatch<React.SetStateAction<Chapter[]>>;
        page: number
    };
}

export function useQuizPageActions({ state }: QuizPageActionsProps) {
    const {
        quizzes,
        setQuizzes,
        setLoading,
        setTotalPages,
        search,
        setSearch,
        setPage,
        selectedQuiz,
        setSelectedQuiz,
        isUpdating,
        setIsUpdating,
        selectedCourse,
        setSelectedCourse,
        setAvailableChapters,
        activeStep,
        setActiveStep,
        courseList,
        setCourseList,
        showStatusModal,
        chapterList,
        setChapterList,
        availableChapters,
        page
    } = state;

    // Modals
    const [opened, { open, close }] = useDisclosure(false);
    const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

    // Form
    const form = useForm<ExtendedQuizCreateDto>({
        initialValues: {
            title: '',
            description: '',
            courseId: undefined,
            chapterId: undefined,
            successPercentage: 70
        },
        validate: {
            title: (value) => 
                value.length === 0 
                    ? 'Le titre est obligatoire' 
                    : value.length < 3 
                        ? 'Le titre doit contenir au moins 3 caractères' 
                        : null,
            description: (value) => 
                value && value.length > 0 && value.length < 10 
                    ? 'La description doit contenir au moins 10 caractères' 
                    : null,
            courseId: (value) => !value ? 'Veuillez sélectionner un cours' : null,
            chapterId: (value) => !value ? 'Veuillez sélectionner un chapitre' : null,
            successPercentage: (value) => 
                value < 1 || value > 100 
                    ? 'Le pourcentage doit être entre 1 et 100' 
                    : null
        }
    });

    // Recherche
    const searchForm = useForm({
        initialValues: { query: '' }
    });

    // Gestion des cours et chapitres
    const handleCourseChange = (courseId: string | null) => {
        setSelectedCourse(courseId || '');
        form.setFieldValue('courseId', courseId ? parseInt(courseId) : undefined);
        form.setFieldValue('chapterId', undefined);
        
        if (courseId && mockChapters[courseId]) {
            setAvailableChapters(mockChapters[courseId]);
        } else {
            setAvailableChapters([]);
        }
        
        // Passer à l'étape suivante si un cours est sélectionné
        if (courseId && activeStep === 0) {
            setActiveStep(1);
        }
    };

    // Chargement des quiz (mock)
    const fetchQuizzes = async () => {
        setLoading(true);
        try {

            let quizList = search ? await getQuizList(page,10,search) : await getQuizList(page,10);
            setQuizzes(quizList.quizzes);
            setTotalPages(quizList.totalPages);
        } catch (error) {
            console.error('Erreur lors du chargement des quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    // Soumission du formulaire
    const handleSubmit = async (values: QuizCreateDto) => {
        setLoading(true);
        try {
            if (isUpdating && selectedQuiz) {
                values.quizId = selectedQuiz?.quizId;
                await updateQuiz(selectedQuiz.quizId, values);
                showStatusModal('success', 'Quiz mise à jour avec succès');
                await fetchQuizzes();
            } else {
                try{
                    await createQuiz(values);
                    showStatusModal('success', 'Quiz créé avec succès');
                    await fetchQuizzes();
                }
                catch (error){
                    showStatusModal('error', 'Une erreur est survenue lors de la création du quiz')
                    console.log(error)
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    // Suppression
    const handleDelete = async () => {
        if (!selectedQuiz) return;
        setLoading(true);
        try {
            await deleteQuiz(selectedQuiz.quizId);
            await fetchQuizzes();
            closeDelete();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gestion des modals
    const handleCloseModal = () => {
        close();
        setSelectedQuiz(null);
        setIsUpdating(false);
        setActiveStep(0);
        setSelectedCourse('');
        setAvailableChapters([]);
        form.reset();
    };



    const handleDeleteClick = (quiz: ExtendedQuiz) => {
        setSelectedQuiz(quiz);
        openDelete();
    };
    const handleEdit = async (quiz: ExtendedQuiz) => {
        setSelectedQuiz(quiz);
        setIsUpdating(true);
        
        // Pré-remplir le formulaire
        form.setValues({
            title: quiz.title,
            description: quiz.description || '',
            courseId: quiz.courseId,
            chapterId: quiz.chapterId,
            successPercentage: quiz.successPercentage
        });

        // Configurer les chapitres disponibles
        if (quiz.courseId) {
            const courseIdStr = quiz.courseId.toString();
            setSelectedCourse(courseIdStr);
            await fetchChapters(courseIdStr, true, quiz);
            setActiveStep(2); // Aller directement aux détails
        }

        open();
    };
    // Recherche
    const handleSearch = (values: { query: string }) => {
        setSearch(values.query);
        setPage(1);
    };

    //load cours
    async function fetchCourses(){
        try {
            const response = await getCourseList();
            console.log(response);
            setCourseList(response);
        }
        catch{
            showStatusModal('error', 'Une erreur est survenue lors de l\'operation')
        }
    }

    //load chapters
    async function fetchChapters(courseId : string, isUpdating=false, currentQuiz?: ExtendedQuiz){
        try{
            const response = await getChaptersByCourseId(Number(courseId));
            setSelectedCourse(courseId.toString() || '');
            form.setFieldValue('courseId', Number(courseId) ? Number(courseId) : undefined);
            
            // Ne pas réinitialiser chapterId en mode édition
            if (!isUpdating) {
                form.setFieldValue('chapterId', undefined);
            }

            if (courseId && response.length > 0 && !isUpdating) {
                setAvailableChapters(response.filter(chapter =>
                    !quizzes.some(quiz => quiz.chapterId === chapter.chapterId)
                ).map(chapter => ({
                    value: chapter.chapterId.toString(),
                    label: chapter.title
                })));
            }
            else if(isUpdating && courseId && response.length > 0){
                const quizToEdit = currentQuiz || selectedQuiz;
                setAvailableChapters(response.filter(chapter =>
                    !quizzes.some(quiz => quiz.chapterId === chapter.chapterId) ||
                    chapter.chapterId === quizToEdit?.chapterId
                ).map(chapter => ({
                    value: chapter.chapterId.toString(),
                    label: chapter.title
                })));
                
            }
            else {
                setAvailableChapters([]);
            }

            // Passer à l'étape suivante si un cours est sélectionné
            if (courseId && activeStep === 0) {
                setActiveStep(1);
            }
        }
        catch{ showStatusModal('error', 'Une erreur est survenue lors de l\'operation')}
    }

    return {
        // Forms
        form,
        searchForm,
        
        // Modals
        opened,
        open,
        close,
        deleteOpened,
        openDelete,
        closeDelete,
        
        // Handlers
        handleCourseChange,
        fetchQuizzes,
        handleSubmit,
        handleDelete,
        handleCloseModal,
        handleEdit,
        handleDeleteClick,
        handleSearch,
        fetchCourses,
        fetchChapters
    };
}
