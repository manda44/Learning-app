import {Grid, Paper, Box, Button, Center, Textarea, Text, Divider, Group, ActionIcon} from "@mantine/core";
import {BlockNoteView} from "@blocknote/mantine";
import {useCreateBlockNote} from "@blocknote/react";
import {fr} from "@blocknote/core/locales";
import {codeBlock} from "@blocknote/code-block";
import {IconPlus, IconQuestionMark, IconFileText, IconMessageCircle, IconTrash, IconCopy, IconChevronUp, IconChevronDown} from "@tabler/icons-react";
import {useState, useCallback, useEffect} from "react";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "@mantine/form";
import type{ QuestionCreateDto } from "../../types/Question";

export type OpenResponseRef = {
    getData: () => QuestionCreateDto;
};

interface OpenResponseProps {
    key:any;
    id: number;
    data: any;
    isLast?: boolean;
    rank?: number;
    moveQuestion: (id: number, direction: number) => void;
    deleteQuestion: (id: number) => void;
    duplicateQuestion: (id: number) => void;
    quizId?: number;
}

const OpenResponse = forwardRef<OpenResponseRef, OpenResponseProps>((props, ref) => {
    const [showExplanation, setShowExplanation] = useState<boolean>(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    const validateData = () => {
        const newErrors: {[key: string]: string} = {};
        
        try {
            // Valider la question
            const questionContent = QuestionEditor.document;
            const questionText = questionContent.map(block => {
                if (block.type === 'paragraph' && block.content) {
                    return block.content.map((content: any) => content.text || '').join('');
                }
                return '';
            }).join('').trim();
            
            if (!questionText) {
                newErrors.question = "La question est obligatoire";
            }

            // Valider la réponse modèle
            const responseContent = ResponseEditor.document;
            const responseText = responseContent.map(block => {
                if (block.type === 'paragraph' && block.content) {
                    return block.content.map((content: any) => content.text || '').join('');
                }
                return '';
            }).join('').trim();
            
            if (!responseText) {
                newErrors.response = "La réponse modèle est obligatoire";
            }
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    useImperativeHandle(ref, () => ({
        getData: () => {
            // Valider avant de retourner les données
            if (!validateData()) {
                throw new Error("Validation failed");
            }
            
            return {
                quizId: props.quizId,
                type: "OPENRESPONSE",
                content: JSON.stringify(QuestionEditor.document),
                rank: props.rank,
                explanation: showExplanation && form.values.explanation ? form.values.explanation : undefined,
                questionItems: [{
                    questionId: 0,
                    content: JSON.stringify(ResponseEditor.document),
                    isRight: true,
                    rightResponse: JSON.stringify(ResponseEditor.document)
                }]
            };
        }
    }));

    const QuestionEditor = useCreateBlockNote({
        dictionary: fr,
        codeBlock,
        initialContent: props.data?.content ? JSON.parse(props.data.content) : undefined
    });

    const ResponseEditor = useCreateBlockNote({
        dictionary: fr,
        codeBlock,
        initialContent: props.data?.questionItems?.[0]?.content ? JSON.parse(props.data.questionItems[0].content) : undefined
    });

    const form = useForm({
        initialValues: {
            response: '',
            explanation: ''
        }
    });

    const toggleExplanation = useCallback(() => {
        setShowExplanation(prev => !prev);
    }, []);

    useEffect(() => {
        if (props.data?.questionItems?.[0]) {
            // Charger la réponse modèle
            ResponseEditor.replaceBlocks(
                ResponseEditor.document,
                JSON.parse(props.data.questionItems[0].content)
            );
        }
        
        if(props.data?.explanation){
            setShowExplanation(true);
            form.setFieldValue('explanation', props.data.explanation);
        }
        
        // Réinitialiser les erreurs après le chargement des données
        setErrors({});
    }, []);

    return(
        <>
            <Paper 
                radius={"lg"} 
                withBorder 
                m={20}
                shadow="md"
                style={{
                    borderLeft: '6px solid #9c27b0',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                        shadow: 'lg'
                    }
                }}
            >
                {/* Numéro de question */}
                <Box 
                    style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '30px',
                        backgroundColor: '#9c27b0',
                        color: 'white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: '0 4px 8px rgba(156, 39, 176, 0.3)',
                        border: '3px solid white',
                        zIndex: 10
                    }}
                >
                    {props.rank}
                </Box>
                <Box 
                    p={4} 
                    style={{
                        backgroundColor: '#9c27b0',
                        borderRadius: '12px 12px 0 0',
                        marginBottom: '20px'
                    }}
                >
                    <Group align="center" justify="center">
                        <IconFileText size={20} color="white" />
                        <Text size="lg" fw={700} c="white">
                            Question Ouverte
                        </Text>
                    </Group>
                </Box>
                <form onSubmit={form.onSubmit((values) => console.log(values))}>
                    <Box p={20}>
                        <Grid>
                            <Grid.Col span={12}>
                                <Group align="center" mb="md">
                                    <IconQuestionMark size={24} color="#1976d2" />
                                    <Text size="xl" fw={600} c="#1976d2">
                                        Question
                                    </Text>
                                </Group>
                                <Divider mb="md" />
                                <Box style={{ minHeight: '10vh' }}>
                                    <Box style={{
                                        border: errors.question ? '2px solid #ff6b6b' : '1px solid #dee2e6',
                                        borderLeft: errors.question ? '4px solid #ff6b6b' : '4px solid #1976d2',
                                        borderRadius: '4px'
                                    }} pt={"md"}>
                                        <BlockNoteView editor={QuestionEditor} theme="light" />
                                    </Box>
                                    {errors.question && (
                                        <Text c="red" size="sm" p="xs">
                                            {errors.question}
                                        </Text>
                                    )}
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                    
                    <Divider style={{ borderColor: '#e9ecef', borderWidth: '2px' }} />
                    
                    <Box p={20}>
                        <Grid>
                            <Grid.Col span={12}>
                                <Group align="center" mb="md">
                                    <IconFileText size={24} color="#9c27b0" />
                                    <Text size="xl" fw={600} c="#9c27b0">
                                        Réponse modèle
                                    </Text>
                                    <Text size="sm" c="dimmed" fs="italic">
                                        (Exemple de réponse attendue)
                                    </Text>
                                </Group>
                                <Divider mb="md" />
                                <Box style={{ minHeight: '5vh' }}>
                                    <Box style={{
                                        border: errors.response ? '2px solid #ff6b6b' : '1px solid #dee2e6',
                                        borderLeft: errors.response ? '4px solid #ff6b6b' : '4px solid #9c27b0',
                                        borderRadius: '4px',
                                        marginTop: '10px'
                                    }} pt={"md"}>
                                        <BlockNoteView editor={ResponseEditor} theme="light" />
                                    </Box>
                                    {errors.response && (
                                        <Text c="red" size="sm" p="xs">
                                            {errors.response}
                                        </Text>
                                    )}
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>
                    
                    <Divider style={{ borderColor: '#e9ecef', borderWidth: '2px' }} />
                    
                    <Box p={20}>
                        <Grid>
                            <Grid.Col span={12}>
                                <Center>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        variant="outline"
                                        onClick={toggleExplanation}
                                        style={{
                                            borderColor: '#28a745',
                                            color: '#28a745',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        {showExplanation ? 'Masquer explication' : 'Ajouter explication'}
                                    </Button>
                                </Center>
                            </Grid.Col>
                        </Grid>
                    </Box>
                    {showExplanation && (
                        <Box>
                            <Divider style={{ borderColor: '#e9ecef', borderWidth: '2px' }} />
                            <Box p={20}>
                                <Grid>
                                    <Grid.Col span={12}>
                                        <Group align="center" mb="md">
                                            <IconMessageCircle size={24} color="#ff6b6b" />
                                            <Text size="xl" fw={600} c="#ff6b6b">
                                                Explication
                                            </Text>
                                            <Text size="sm" c="dimmed" fs="italic">
                                                (Facultatif - Aidez les étudiants à comprendre)
                                            </Text>
                                        </Group>
                                        <Divider mb="md" />
                                        <Textarea
                                            {...form.getInputProps('explanation')}
                                            placeholder="Entrez l'explication de la réponse..."
                                            rows={4}
                                            mt="sm"
                                            style={{
                                                border: '1px solid #dee2e6',
                                                borderLeft: '4px solid #ff6b6b',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                    
                    {/* Boutons d'actions de la question */}
                    <Box p={20}>
                        <Divider style={{ borderColor: '#e9ecef', borderWidth: '1px' }} mb="md" />
                        <Group justify="center" gap="md">
                            <Button
                                leftSection={<IconCopy size={16} />}
                                variant="outline"
                                size="sm"
                                color="blue"
                                onClick={() => props.duplicateQuestion(props.id)}
                            >
                                Dupliquer
                            </Button>
                            {props.rank !== 1 && (
                                <Button
                                    leftSection={<IconChevronUp size={16} />}
                                    variant="outline"
                                    size="sm"
                                    color="gray"
                                    onClick={() => props.moveQuestion(props.id, 1)}
                                >
                                    Monter
                                </Button>
                            )}
                            {!props.isLast && (
                                <Button
                                    leftSection={<IconChevronDown size={16} />}
                                    variant="outline"
                                    size="sm"
                                    color="gray"
                                    onClick={() => props.moveQuestion(props.id, -1)}
                                >
                                    Descendre
                                </Button>
                            )}
                            <Button
                                leftSection={<IconTrash size={16} />}
                                variant="outline"
                                size="sm"
                                color="red"
                                onClick={() => props.deleteQuestion(props.id)}
                            >
                                Supprimer la question
                            </Button>
                        </Group>
                    </Box>
                </form>
            </Paper>
        </>
    );
});

export default OpenResponse;