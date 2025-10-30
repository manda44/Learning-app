/* eslint-disable */
import {useQuizStates} from "../../hooks/quiz/quizStates.ts";
import {useEffect, useState} from "react";
import {Box, Button,Grid, Group, Menu, Paper, Modal, Text, Image, LoadingOverlay, ScrollArea} from "@mantine/core";
import {IconChevronDown, IconEye} from "@tabler/icons-react";
import html2canvas from 'html2canvas';
import Mcq from "../../components/Quiz/Mcq.tsx";
import {useQuizActions} from "../../hooks/quiz/quizActions.ts";
import UniqueChoice from "../../components/Quiz/UniqueChoice.tsx";
import OpenResponse from "../../components/Quiz/OpenResponse.tsx";
import {useParams} from "react-router-dom";


export default function QuizList(){
    //#region variables
    const [previewOpened, setPreviewOpened] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const { quizId } = useParams();

    const breadCurmbs = [
        {
            title: 'Cours & contenus',
            href: '/course'
        },
        {
            title: 'Quiz',
            href: '#'
        }
    ]
    const {
        setBreadCrumb, mcqs, setMcqs
    } = useQuizStates();
    const{
        addMcq, getAllData,FetchQuestions,addUniqueChoice, addOpenResponse,
        moveQuestion,deleteQuestion,duplicateQuestion
    } = useQuizActions({
        state: {
            mcqs, setMcqs
        }
    });

    //#region useEffect
    useEffect(() => {
        const loadData = async () => {
            setBreadCrumb(breadCurmbs as any);
            await FetchQuestions(Number(quizId ?? 0));
        };
        
        loadData();
    }, [])
    //#endregion

    const handlePreview = async () => {
        setIsGeneratingImage(true);
        setPreviewOpened(true);
        
        try {
            // Masquer tous les boutons avant capture
            const buttons = document.querySelectorAll('#quiz-container button, #quiz-container .mantine-ActionIcon-root');
            buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');
            
            // Attendre un peu pour que le DOM se mette à jour
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const element = document.getElementById('quiz-container');
            if (element) {
                const canvas = await html2canvas(element, {
                    scale: 2, // Meilleure qualité
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/png');
                setPreviewImage(imgData);
            }
            
            // Restaurer les boutons après capture
            buttons.forEach(btn => (btn as HTMLElement).style.display = '');
            
        } catch (error) {
            console.error('Erreur lors de la génération de l\'image:', error);
            // Restaurer les boutons en cas d'erreur
            const buttons = document.querySelectorAll('#quiz-container button, #quiz-container .mantine-ActionIcon-root');
            buttons.forEach(btn => (btn as HTMLElement).style.display = '');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return(
        <>
            <Box
                id="quiz-container"
                style={{
                    background: '#f5f5f5',
                    minHeight: '100vh'
                }}
            >
                <Paper
                    radius="md"
                    withBorder
                    p={32}
                    style={{
                        width: '100%',
                        background: '#fff',
                        border: '1px solid #ddd',
                        position: 'sticky',
                        top: 60,
                        zIndex: 100,
                    }}
                >
                    <Grid justify="center" align="center">
                        <Grid.Col span={8} offset={4}>
                            <Group align="center" style={{ width: '100%' }}>
                                <Group>
                                    <Menu shadow="md" width={200}>
                                        <Menu.Target>
                                            <Button
                                                color="blue"
                                                variant="filled"
                                                size="md"
                                                radius="md"
                                                rightSection={<IconChevronDown size={18} />}
                                                style={{ fontWeight: 700 }}
                                            >
                                                Ajouter
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item onClick={addMcq}>Choix multiple</Menu.Item>
                                            <Menu.Item onClick={addUniqueChoice}>Choix unique</Menu.Item>
                                            <Menu.Item onClick={addOpenResponse}>Question ouverte</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                    <Button
                                        color="blue"
                                        variant="outline"
                                        size="md"
                                        radius="md"
                                        style={{ fontWeight: 400 }}
                                        leftSection={<IconEye size={18} />}
                                        onClick={handlePreview}
                                    >
                                        Visualiser
                                    </Button>
                                    <Button
                                        color="green"
                                        variant="filled"
                                        size="md"
                                        radius="md"
                                        style={{ fontWeight: 700 }}
                                        onClick={getAllData}
                                    >
                                        Enregistrer
                                    </Button>
                                </Group>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
                {mcqs.map((mcq,index) => {
                    if (mcq.type === "MCQ") {
                        return <Mcq key={mcq.id} quizId={Number(quizId)} duplicateQuestion={duplicateQuestion}  deleteQuestion={deleteQuestion} id={mcq.id} data={mcq.data} moveQuestion={moveQuestion} isLast={index === mcqs.length - 1}  rank={mcq.rank} ref={mcq.ref} />;
                    } else if (mcq.type === "UNIQUECHOICE") {
                        return <UniqueChoice key={mcq.id} quizId={Number(quizId)} duplicateQuestion={duplicateQuestion} deleteQuestion={deleteQuestion} id={mcq.id} data={mcq.data} moveQuestion={moveQuestion} isLast={index === mcqs.length - 1} rank={mcq.rank} ref={mcq.ref} />;
                    } else if (mcq.type === "OPENRESPONSE") {
                        return <OpenResponse key={mcq.id} quizId={Number(quizId)} duplicateQuestion={duplicateQuestion} deleteQuestion={deleteQuestion} id={mcq.id} data={mcq.data} moveQuestion={moveQuestion} isLast={index === mcqs.length - 1} rank={mcq.rank} ref={mcq.ref} />;
                    } else {
                        return null;
                    }
                })}
                
                {/* Modal de prévisualisation image */}
                <Modal 
                    opened={previewOpened} 
                    onClose={() => setPreviewOpened(false)}
                    title="Aperçu du Quiz (Image)"
                    size="95%"
                    centered
                    styles={{
                        content: { height: '90vh' },
                        body: { height: 'calc(90vh - 60px)', padding: 0 }
                    }}
                >
                    <LoadingOverlay visible={isGeneratingImage} />
                    {previewImage && !isGeneratingImage ? (
                        <ScrollArea h="100%" p="md">
                            <Image 
                                src={previewImage} 
                                alt="Quiz Preview" 
                                style={{
                                    width: '100%',
                                    minHeight: 'auto',
                                    maxWidth: 'none'
                                }}
                                fit="contain"
                            />
                        </ScrollArea>
                    ) : !isGeneratingImage ? (
                        <Text p="md">Aucune image générée</Text>
                    ) : null}
                </Modal>
            </Box>
        </>
    )
}