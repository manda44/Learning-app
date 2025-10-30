import {Grid, Paper, Button, Center, Box, Checkbox, Group, Radio, RadioGroup, Textarea, Text, Divider, ActionIcon} from "@mantine/core";
import {BlockNoteView} from "@blocknote/mantine";
import {useCreateBlockNote} from "@blocknote/react";
import {fr} from "@blocknote/core/locales";
import {codeBlock} from "@blocknote/code-block";
import {IconPlus, IconQuestionMark, IconCircleCheck, IconMessageCircle, IconTrash, IconCopy, IconChevronUp, IconChevronDown} from "@tabler/icons-react";
import {useState, useCallback, useMemo, useEffect} from "react";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "@mantine/form";
import { BlockNoteEditor } from "@blocknote/core";
import type{ QuestionCreateDto } from "../../types/Question";

export type UniqueChoiceRef = {
    getData: () => QuestionCreateDto;
};

interface UniqueChoiceProps {
    key:any;
    data: any;
    id: number;
    isLast?: boolean;
    rank?: number;
    moveQuestion: (id: number, direction: number) => void;
    deleteQuestion: (id: number) => void;
    duplicateQuestion: (id: number) => void;
    quizId?: number;
}

// Type pour une option MCQ
type UniqueChoiceOption = {
    id: number;
    editor: BlockNoteEditor;
    checked: boolean;
};

const UniqueChoice = forwardRef<UniqueChoiceRef, UniqueChoiceProps>((props, ref) => {
    useImperativeHandle(ref, () => ({
        getData: () => {
            if (validateData()) {
                return ({
                    quizId: props.quizId,
                    type: "UNIQUECHOICE",
                    content: JSON.stringify(QuestionEditor.document),
                    rank: props.rank,
                    explanation: showExplanation && form.values.explanation ? form.values.explanation : undefined,
                    questionItems: optionEditors.slice(0, optionCount).map((option, index) => ({
                        questionId: 0, // Sera défini par l'API
                        content: JSON.stringify(option.editor.document),
                        isRight: form.values.selectedOption === index.toString(),
                        rightResponse: undefined
                    }))
                });
            }
            throw new Error("Validation failed");
        }
    }));
    const [optionCount, setOptionCount] = useState<number>(0);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);
    const [errors, setErrors] = useState<{question?: string, options?: string[]}>({});

    const QuestionEditor = useCreateBlockNote({
        dictionary: fr,
        codeBlock,
        initialContent: props.data?.content ? JSON.parse(props.data.content) : undefined
    });

    // Création des éditeurs d'options (maximum 10)
    const editor1 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor2 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor3 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor4 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor5 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor6 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor7 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor8 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor9 = useCreateBlockNote({ dictionary: fr, codeBlock });
    const editor10 = useCreateBlockNote({ dictionary: fr, codeBlock });

    const optionEditors: UniqueChoiceOption[] = useMemo(() => [
        { id: 0, editor: editor1, checked: false },
        { id: 1, editor: editor2, checked: false },
        { id: 2, editor: editor3, checked: false },
        { id: 3, editor: editor4, checked: false },
        { id: 4, editor: editor5, checked: false },
        { id: 5, editor: editor6, checked: false },
        { id: 6, editor: editor7, checked: false },
        { id: 7, editor: editor8, checked: false },
        { id: 8, editor: editor9, checked: false },
        { id: 9, editor: editor10, checked: false }
    ], [editor1, editor2, editor3, editor4, editor5, editor6, editor7, editor8, editor9, editor10]);

    const form = useForm({
        initialValues: {
            selectedOption: '',
            explanation: '',
            options: optionEditors.slice(0, optionCount).map(option => ({
                id: option.id,
                checked: false
            }))
        }
    });

    const addOption = useCallback(() => {
        if (optionCount < 10) {
            const newCount = optionCount + 1;
            setOptionCount(newCount);

            // Préserver les valeurs existantes et ajouter la nouvelle option
            const currentValues = form.values.options || [];
            const newOptions = [...currentValues, { id: newCount - 1, checked: false }];

            form.setFieldValue('options', newOptions);
        }
    }, [optionCount, form]);

    const toggleExplanation = useCallback(() => {
        setShowExplanation(prev => !prev);
    }, []);

    const removeOption = useCallback((indexToRemove: number) => {
        setOptionCount(prev => prev - 1);
        const updatedOptions = form.values.options.filter((_, i) => i !== indexToRemove);
        form.setFieldValue('options', updatedOptions);
    }, [form]);

    const validateData = useCallback(() => {
        const newErrors: {question?: string, options?: string[]} = {};
        
        // Valider la question - extrait le texte de tous les blocks
        const questionText = QuestionEditor.document
            .map(block => {
                try {
                    // Pour les blocks de paragraphe avec du texte
                    if (block.content && Array.isArray(block.content)) {
                        return block.content.map((item: any) => 
                            item && typeof item === 'object' && item.text ? item.text : ''
                        ).join('');
                    }
                    return '';
                } catch {
                    return '';
                }
            })
            .join('')
            .trim();
        
        if (!questionText) {
            newErrors.question = "La question ne peut pas être vide";
        }
        
        // Valider les options
        const optionErrors: string[] = [];
        for (let i = 0; i < optionCount; i++) {
            const optionText = optionEditors[i].editor.document
                .map(block => {
                    try {
                        // Pour les blocks de paragraphe avec du texte
                        if (block.content && Array.isArray(block.content)) {
                            return block.content.map((item: any) => 
                                item && typeof item === 'object' && item.text ? item.text : ''
                            ).join('');
                        }
                        return '';
                    } catch {
                        return '';
                    }
                })
                .join('')
                .trim();
            
            if (!optionText) {
                optionErrors[i] = "Cette option ne peut pas être vide";
            }
        }
        
        if (optionErrors.some(error => error)) {
            newErrors.options = optionErrors;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [QuestionEditor, optionEditors, optionCount]);
    useEffect(() => {
        if (props.data?.questionItems) {
            const itemCount = Math.min(props.data.questionItems.length, 10);
            setOptionCount(itemCount);

            // Initialiser les options du formulaire
            const formOptions = props.data.questionItems.slice(0, itemCount).map((item: any, index: number) => ({
                id: index,
                checked: item.isRight || false
            }));

            // Set selected option based on which one is right
            const selectedIndex = props.data.questionItems.findIndex((item: any) => item.isRight);
            
            if(props.data.explanation){
                setShowExplanation(true);
                form.setFieldValue('explanation', props.data.explanation);
            }
            
            form.setValues({ 
                options: formOptions,
                selectedOption: selectedIndex >= 0 ? selectedIndex.toString() : ''
            });

            // Charger le contenu dans les éditeurs
            props.data.questionItems.forEach((item: any, index: number) => {
                if (index < itemCount) {
                    optionEditors[index].editor.replaceBlocks(
                        optionEditors[index].editor.document,
                        JSON.parse(item.content)
                    );
                }
            });
        }
    }, []);

    return(
        <>
            <Paper 
                radius={"lg"} 
                withBorder 
                m={20}
                shadow="md"
                style={{
                    borderLeft: '6px solid #ff9800',
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
                        backgroundColor: '#ff9800',
                        color: 'white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)',
                        border: '3px solid white',
                        zIndex: 10
                    }}
                >
                    {props.rank}
                </Box>
                <Box 
                    p={4} 
                    style={{
                        backgroundColor: '#ff9800',
                        borderRadius: '12px 12px 0 0',
                        marginBottom: '20px'
                    }}
                >
                    <Group align="center" justify="center">
                        <IconCircleCheck size={20} color="white" />
                        <Text size="lg" fw={700} c="white">
                            Question à Choix Unique
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
                                <Box style={{ 
                                    minHeight: '10vh',
                                    border: errors.question ? '2px solid #ff6b6b' : 'none',
                                    borderRadius: '4px',
                                    padding: errors.question ? '8px' : '0'
                                }}>
                                    <BlockNoteView editor={QuestionEditor} theme="light" />
                                </Box>
                                {errors.question && (
                                    <Text c="red" size="sm" mt="xs">
                                        {errors.question}
                                    </Text>
                                )}
                            </Grid.Col>
                        </Grid>
                    </Box>
                    
                    <Divider style={{ borderColor: '#e9ecef', borderWidth: '2px' }} />
                    
                    <Box p={20}>
                        <Grid>
                            <Grid.Col span={12}>
                                <Group align="center" mb="md">
                                    <IconCircleCheck size={24} color="#ff9800" />
                                    <Text size="xl" fw={600} c="#ff9800">
                                        Réponses
                                    </Text>
                                    <Text size="sm" c="dimmed" fs="italic">
                                        (Sélectionnez une seule bonne réponse)
                                    </Text>
                                </Group>
                                <Divider mb="md" />
                                <Box style={{ minHeight: '5vh' }}>
                                    <Radio.Group
                                        value={form.values.selectedOption}
                                        onChange={(value) => form.setFieldValue('selectedOption', value)}
                                    >
                                        {optionEditors.slice(0, optionCount).map((option, index) => (
                                            <Group key={option.id} justify="flex-start" align="center" mb="sm">
                                                <Radio 
                                                    value={index.toString()}
                                                    mr="md"
                                                    size="md"
                                                    style={{ alignSelf: 'center' }} 
                                                />
                                                <Box flex={1} style={{
                                                    border: errors.options?.[index] ? '2px solid #ff6b6b' : '1px solid #dee2e6',
                                                    borderLeft: errors.options?.[index] ? '4px solid #ff6b6b' : '4px solid #ff9800',
                                                    borderRadius: '4px'
                                                }} pt={"md"}>
                                                    <BlockNoteView editor={option.editor} theme="light" />
                                                    {errors.options?.[index] && (
                                                        <Text c="red" size="sm" p="xs">
                                                            {errors.options[index]}
                                                        </Text>
                                                    )}
                                                </Box>
                                                <ActionIcon
                                                    color="red"
                                                    variant="outline"
                                                    size="sm"
                                                    ml="xs"
                                                    style={{ alignSelf: 'center' }}
                                                    onClick={() => removeOption(index)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        ))}
                                    </Radio.Group>
                                </Box>
                               <Center mt={20}>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        variant="outline"
                                        onClick={addOption}
                                        disabled={optionCount >= 10}
                                        style={{
                                            borderColor: '#007bff',
                                            color: '#007bff',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        Ajouter option
                                    </Button>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        variant="outline"
                                        onClick={toggleExplanation}
                                        ml="sm"
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

export default UniqueChoice;