import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Card,
    Badge,
    ActionIcon,
    Menu,
    TextInput,
    Pagination,
    Modal,
    Textarea,
    LoadingOverlay,
    Box,
    Grid,
    Avatar,
    Transition,
    Flex,
    Center,
    Select,
    NumberInput,
    Stepper
} from '@mantine/core';
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconEye,
    IconDots,
    IconQuestionMark,
    IconClipboardList,
    IconCalendar,
    IconChartBar,
    IconRefresh,
    IconBook,
    IconBookmark,
    IconTarget
} from '@tabler/icons-react';
import { useQuizPageStates, mockCourses, mockChapters } from '../../hooks/quiz/quizPageStates';
import { useQuizPageActions } from '../../hooks/quiz/quizPageActions';

export default function QuizPage() {
    // Utilisation des hooks personnalisés
    const states = useQuizPageStates();
    const actions = useQuizPageActions({ state: states });

    const {
        quizzes,
        loading,
        page,
        totalPages,
        search,
        setBreadCrumb,
        breadcrumbs,
        selectedQuiz,
        setPage,
        isUpdating,
        selectedCourse,
        availableChapters,
        activeStep,
        setActiveStep,
        mockCourses,
        courseList,
        setCourseList,
        showStatusModal,
        chapterList,
        setChapterList
    } = states;

    const {
        form,
        searchForm,
        opened,
        open,
        deleteOpened,
        closeDelete,
        fetchQuizzes,
        handleSubmit,
        handleDelete,
        handleCloseModal,
        handleEdit,
        handleDeleteClick,
        handleSearch,
        handleCourseChange,
        fetchCourses,
        fetchChapters
    } = actions;

    // Effects
    useEffect(() => {
        setBreadCrumb(breadcrumbs as any);
        fetchQuizzes();
        fetchCourses();
    }, [page, search]);

    return (
        <Box
            style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                minHeight: '100vh',
                padding: '2rem 0'
            }}
        >
            <Container size="xl">
                {/* En-tête avec design moderne */}
                <Paper
                    radius="xl"
                    p="xl"
                    shadow="xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        marginBottom: '2rem'
                    }}
                >
                    <Group justify="space-between" align="center">
                        <Box>
                            <Group align="center" gap="md">
                                <Avatar
                                    size="lg"
                                    radius="xl"
                                    style={{
                                        background: 'linear-gradient(45deg, #495057, #6c757d)',
                                        color: 'white'
                                    }}
                                >
                                    <IconClipboardList size={28} />
                                </Avatar>
                                <Box>
                                    <Title
                                        order={1}
                                        size="2.5rem"
                                        style={{
                                            background: 'linear-gradient(45deg, #495057, #6c757d)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 700
                                        }}
                                    >
                                        Gestion des Quiz
                                    </Title>
                                    <Text c="dimmed" size="lg">
                                        Créez et gérez vos quiz interactifs
                                    </Text>
                                </Box>
                            </Group>
                        </Box>
                        
                        <Group gap="md">
                            <Button
                                leftSection={<IconRefresh size={18} />}
                                variant="light"
                                color="gray"
                                onClick={fetchQuizzes}
                                loading={loading}
                            >
                                Actualiser
                            </Button>
                            <Button
                                leftSection={<IconPlus size={18} />}
                                size="md"
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                                onClick={open}
                            >
                                Nouveau Quiz
                            </Button>
                        </Group>
                    </Group>
                </Paper>

                {/* Barre de recherche */}
                <Paper
                    radius="xl"
                    p="md"
                    shadow="md"
                    style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        marginBottom: '2rem'
                    }}
                >
                    <form onSubmit={searchForm.onSubmit(handleSearch)}>
                        <Group gap="md">
                            <TextInput
                                placeholder="Rechercher un quiz..."
                                size="md"
                                radius="xl"
                                flex={1}
                                leftSection={<IconSearch size={18} />}
                                {...searchForm.getInputProps('query')}
                                style={{ flex: 1 }}
                            />
                            <Button
                                type="submit"
                                size="md"
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: 'green', to: 'teal', deg: 45 }}
                            >
                                Rechercher
                            </Button>
                        </Group>
                    </form>
                </Paper>

                {/* Statistiques rapides */}
                <Grid mb="xl">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card
                            radius="xl"
                            shadow="md"
                            style={{
                                background: 'linear-gradient(45deg, #4dabf7, #339af0)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <Group>
                                <IconClipboardList size={32} />
                                <Box>
                                    <Text size="xl" fw={700}>{quizzes.length}</Text>
                                    <Text size="sm" opacity={0.8}>Quiz créés</Text>
                                </Box>
                            </Group>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card
                            radius="xl"
                            shadow="md"
                            style={{
                                background: 'linear-gradient(45deg, #51cf66, #40c057)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <Group>
                                <IconQuestionMark size={32} />
                                <Box>
                                    <Text size="xl" fw={700}>
                                        {quizzes.reduce((sum, quiz) => sum + (quiz.questionCount || 0), 0)}
                                    </Text>
                                    <Text size="sm" opacity={0.8}>Questions totales</Text>
                                </Box>
                            </Group>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card
                            radius="xl"
                            shadow="md"
                            style={{
                                background: 'linear-gradient(45deg, #ff8cc8, #ff6b9d)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <Group>
                                <IconChartBar size={32} />
                                <Box>
                                    <Text size="xl" fw={700}>
                                        {Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.questionCount || 0), 0) / (quizzes.length || 1))}
                                    </Text>
                                    <Text size="sm" opacity={0.8}>Moyenne/Quiz</Text>
                                </Box>
                            </Group>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Liste des quiz */}
                <Stack gap="md">
                    {loading ? (
                        <Center h={200}>
                            <LoadingOverlay visible />
                        </Center>
                    ) : quizzes.length === 0 ? (
                        <Card
                            radius="xl"
                            shadow="sm"
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'center',
                                padding: '3rem'
                            }}
                        >
                            <IconClipboardList size={64} color="#ccc" />
                            <Title order={3} c="dimmed" mt="md">
                                Aucun quiz trouvé
                            </Title>
                            <Text c="dimmed" mt="xs">
                                Commencez par créer votre premier quiz
                            </Text>
                            <Button
                                mt="md"
                                leftSection={<IconPlus size={16} />}
                                onClick={open}
                            >
                                Créer un quiz
                            </Button>
                        </Card>
                    ) : (
                        quizzes.map((quiz) => (
                            <Transition
                                key={quiz.quizId}
                                mounted={true}
                                transition="slide-up"
                                duration={300}
                            >
                                {(styles) => (
                                    <Card
                                        style={{
                                            ...styles,
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textDecoration: 'none',
                                            color: 'inherit'
                                        }}
                                        radius="xl"
                                        shadow="md"
                                        p="xl"
                                        className="quiz-card"
                                    >
                                        <Flex justify="space-between" align="flex-start">
                                            <Box flex={1}>
                                                <Group mb="sm">
                                                    <Avatar
                                                        size="md"
                                                        radius="xl"
                                                        variant="gradient"
                                                        gradient={{ from: 'violet', to: 'purple', deg: 45 }}
                                                    >
                                                        <IconClipboardList size={20} />
                                                    </Avatar>
                                                    <Box>
                                                        <Title order={3} size="1.5rem" mb={4}>
                                                            {quiz.title}
                                                        </Title>
                                                        <Group gap="xs" mb="xs">
                                                            <Badge
                                                                size="sm"
                                                                variant="gradient"
                                                                gradient={{ from: 'blue', to: 'cyan' }}
                                                                leftSection={<IconQuestionMark size={12} />}
                                                            >
                                                                {quiz.questionCount || 0} questions
                                                            </Badge>
                                                            <Badge
                                                                size="sm"
                                                                variant="gradient"
                                                                gradient={{ from: 'green', to: 'teal' }}
                                                                leftSection={<IconTarget size={12} />}
                                                            >
                                                                {quiz.successPercentage}% requis
                                                            </Badge>
                                                            {quiz.createdAt && (
                                                                <Badge
                                                                    size="sm"
                                                                    variant="gradient"
                                                                    gradient={{ from: 'orange', to: 'yellow' }}
                                                                    leftSection={<IconCalendar size={12} />}
                                                                >
                                                                    {new Date(quiz.createdAt).toLocaleDateString()}
                                                                </Badge>
                                                            )}
                                                        </Group>
                                                        
                                                        {/* Informations cours et chapitre */}
                                                        <Group gap="xs">
                                                            {quiz.courseId && (
                                                                <Badge
                                                                    size="sm"
                                                                    variant="outline"
                                                                    color="dark"
                                                                    leftSection={<IconBook size={12} />}
                                                                >
                                                                    {quiz.courseName || 'Cours'}
                                                                </Badge>
                                                            )}
                                                            {quiz.chapterId && (
                                                                <Badge
                                                                    size="sm"
                                                                    variant="outline"
                                                                    color="gray"
                                                                    leftSection={<IconBookmark size={12} />}
                                                                >
                                                                    {quiz.chapterName || 'Chapitre'}
                                                                </Badge>
                                                            )}
                                                        </Group>
                                                    </Box>
                                                </Group>
                                                
                                                {quiz.description && (
                                                    <Text c="dimmed" size="sm" lineClamp={2} mb="md">
                                                        {quiz.description}
                                                    </Text>
                                                )}
                                            </Box>

                                            <Menu shadow="md" width={200}>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        variant="gradient"
                                                        gradient={{ from: 'indigo', to: 'blue' }}
                                                        size="lg"
                                                        radius="xl"
                                                    >
                                                        <IconDots size={18} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEye size={16} />}
                                                        component={Link}
                                                        to={"/quiz/" + quiz.quizId}
                                                    >
                                                        Voir les questions
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={16} />}
                                                        onClick={() => handleEdit(quiz as any)}
                                                    >
                                                        Modifier
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={16} />}
                                                        color="red"
                                                        onClick={() => handleDeleteClick(quiz as any)}
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Flex>
                                    </Card>
                                )}
                            </Transition>
                        ))
                    )}
                </Stack>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Paper
                        radius="xl"
                        p="lg"
                        mt="xl"
                        shadow="md"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <Group justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                Page {page} sur {totalPages} • {quizzes.length} quiz
                            </Text>
                            <Pagination
                                value={page}
                                onChange={setPage}
                                total={totalPages}
                                size="md"
                                radius="xl"
                                styles={{
                                    control: {
                                        '&[data-active]': {
                                            background: 'linear-gradient(45deg, #4dabf7, #339af0)',
                                            border: 'none',
                                            color: 'white'
                                        },
                                        '&:hover:not([data-active])': {
                                            background: 'rgba(77, 171, 247, 0.1)',
                                            border: '1px solid rgba(77, 171, 247, 0.3)'
                                        }
                                    }
                                }}
                            />
                        </Group>
                    </Paper>
                )}
            </Container>

            {/* Modal de création/modification */}
            <Modal
                opened={opened}
                onClose={handleCloseModal}
                title={
                    <Group>
                        <IconClipboardList size={24} />
                        <Text size="lg" fw={600}>
                            {isUpdating ? 'Modifier le quiz' : 'Nouveau quiz'}
                        </Text>
                    </Group>
                }
                size="xl"
                radius="md"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="lg">
                        {/* Stepper pour la création */}
                        {!isUpdating && (
                            <Stepper 
                                active={activeStep} 
                                onStepClick={setActiveStep}
                                allowNextStepsSelect={false}
                                mb="xl"
                                color="blue"
                            >
                                <Stepper.Step 
                                    label="Cours" 
                                    description="Sélectionner le cours"
                                    icon={<IconBook size={18} />}
                                />
                                <Stepper.Step 
                                    label="Chapitre" 
                                    description="Choisir le chapitre"
                                    icon={<IconBookmark size={18} />}
                                />
                                <Stepper.Step 
                                    label="Détails" 
                                    description="Informations du quiz"
                                    icon={<IconTarget size={18} />}
                                />
                            </Stepper>
                        )}

                        {/* Étape 1: Sélection du cours */}
                        {(activeStep === 0 && !isUpdating) && (
                            <Box>
                                <Title order={4} mb="md" c="dark.6">
                                    Sélectionnez le cours pour ce quiz
                                </Title>
                                <Select
                                    label="Cours"
                                    placeholder="Choisissez un cours"
                                    size="md"
                                    data={courseList.map((course) => ({
                                        value: course.courseId.toString(),
                                        label: course.title,
                                        description: course.description || 'Aucune description'
                                    }))}
                                    value={selectedCourse}
                                    onChange={(value) => {
                                        if (value) {
                                            fetchChapters(value);
                                        }
                                    }}
                                    searchable
                                    rightSection={<IconBook size={16} />}
                                    description="Le cours auquel ce quiz sera associé"
                                />
                                
                                {selectedCourse && (
                                    <Paper p="md" mt="md" radius="md" style={{ 
                                        background: 'linear-gradient(45deg, rgba(77, 171, 247, 0.1), rgba(51, 154, 240, 0.1))',
                                        border: '1px solid rgba(77, 171, 247, 0.3)'
                                    }}>
                                        <Group>
                                            <IconBook size={20} style={{ color: '#4dabf7' }} />
                                            <Box>
                                                <Text fw={500}>
                                                    {courseList.find(c => c.courseId === Number(selectedCourse))?.title}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {courseList.find(c => c.courseId === Number(selectedCourse))?.description}
                                                </Text>
                                            </Box>
                                        </Group>
                                    </Paper>
                                )}
                                
                                <Group justify="flex-end" mt="xl">
                                    <Button
                                        variant="gradient"
                                        gradient={{ from: 'red', to: 'pink' }}
                                        onClick={handleCloseModal}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        gradient={{ from: 'blue', to: 'cyan' }}
                                        disabled={!selectedCourse}
                                        onClick={() => setActiveStep(1)}
                                        rightSection={<IconBookmark size={16} />}
                                    >
                                        Continuer
                                    </Button>
                                </Group>
                            </Box>
                        )}

                        {/* Étape 2: Sélection du chapitre */}
                        {(activeStep === 1 && !isUpdating) && (
                            <Box>
                                <Title order={4} mb="md" c="dark.6">
                                    Sélectionnez le chapitre
                                </Title>
                                <Select
                                    label="Chapitre"
                                    placeholder="Choisissez un chapitre"
                                    size="md"
                                    data={availableChapters}
                                    searchable
                                    rightSection={<IconBookmark size={16} />}
                                    description="Le chapitre spécifique pour ce quiz"
                                    {...form.getInputProps('chapterId')}
                                />
                                
                                {/* Note informative */}
                                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                    💡 Les chapitres ayant déjà un quiz ne sont pas affichés dans la liste
                                </Text>
                                
                                {form.values.chapterId && (
                                    <Paper p="md" mt="md" radius="md" style={{ 
                                        background: 'linear-gradient(45deg, rgba(81, 207, 102, 0.1), rgba(64, 192, 87, 0.1))',
                                        border: '1px solid rgba(81, 207, 102, 0.3)'
                                    }}>
                                        <Group>
                                            <IconBookmark size={20} style={{ color: '#51cf66' }} />
                                            <Box>
                                                <Text fw={500}>
                                                    {availableChapters.find(c => c.value === form.values.chapterId?.toString())?.label}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    Chapitre sélectionné pour ce quiz
                                                </Text>
                                            </Box>
                                        </Group>
                                    </Paper>
                                )}
                                
                                <Group justify="space-between" mt="xl">
                                    <Button
                                        variant="gradient"
                                        gradient={{ from: 'gray', to: 'dark' }}
                                        onClick={() => setActiveStep(0)}
                                        leftSection={<IconBook size={16} />}
                                    >
                                        Retour
                                    </Button>
                                    <Group>
                                        <Button
                                            variant="gradient"
                                            gradient={{ from: 'red', to: 'pink' }}
                                            onClick={handleCloseModal}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            variant="gradient"
                                            gradient={{ from: 'blue', to: 'cyan' }}
                                            disabled={!form.values.chapterId}
                                            onClick={() => setActiveStep(2)}
                                            rightSection={<IconTarget size={16} />}
                                        >
                                            Continuer
                                        </Button>
                                    </Group>
                                </Group>
                            </Box>
                        )}

                        {/* Étape 3: Détails du quiz (ou mode édition) */}
                        {(activeStep === 2 || isUpdating) && (
                            <Box>
                                <Title order={4} mb="md" c="dark.6">
                                    Détails du quiz
                                </Title>
                                
                                <Stack gap="md">
                                    {/* Sélections en mode édition */}
                                    {isUpdating && (
                                        <>
                                            <Select
                                                label="Cours"
                                                placeholder="Choisissez un cours"
                                                size="md"
                                                data={courseList.map((course) => ({
                                                    value: course.courseId.toString(),
                                                    label: course.title,
                                                    description: course.description || 'Aucune description'
                                                }))}
                                                value={selectedCourse}
                                                onChange={(value) => {
                                                    if (value) {
                                                        fetchChapters(value);
                                                    }
                                                }}
                                                searchable
                                                rightSection={<IconBook size={16} />}
                                            />
                                            
                                            <Select
                                                label="Chapitre"
                                                placeholder="Choisissez un chapitre"
                                                size="md"
                                                value={form.values.chapterId?.toString()}
                                                onChange={(value) => form.setFieldValue('chapterId', value ? Number(value) : undefined)}
                                                data={availableChapters}
                                                searchable
                                                rightSection={<IconBookmark size={16} />}
                                            />
                                        </>
                                    )}
                                    
                                    <TextInput
                                        label="Titre du quiz"
                                        placeholder="Entrez le titre du quiz"
                                        size="md"
                                        required
                                        {...form.getInputProps('title')}
                                    />
                                    
                                    <Textarea
                                        label="Description"
                                        placeholder="Décrivez votre quiz (optionnel)"
                                        size="md"
                                        rows={4}
                                        {...form.getInputProps('description')}
                                    />

                                    <NumberInput
                                        label="Pourcentage de réussite requis"
                                        placeholder="Seuil de réussite"
                                        size="md"
                                        min={1}
                                        max={100}
                                        suffix="%"
                                        description="Pourcentage minimum pour réussir le quiz"
                                        rightSection={<IconTarget size={16} />}
                                        {...form.getInputProps('successPercentage')}
                                    />

                                    {/* Récapitulatif des sélections */}
                                    {(selectedCourse || form.values.courseId) && (
                                        <Paper p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
                                            <Title order={6} mb="xs">Récapitulatif</Title>
                                            <Stack gap="xs">
                                                <Group>
                                                    <IconBook size={16} style={{ color: '#4dabf7' }} />
                                                    <Text size="sm">
                                                        <strong>Cours:</strong> {courseList.find(c => c.courseId === (Number(selectedCourse) || form.values.courseId?.toString()))?.title}
                                                    </Text>
                                                </Group>
                                                {form.values.chapterId && (
                                                    <Group>
                                                        <IconBookmark size={16} style={{ color: '#51cf66' }} />
                                                        <Text size="sm">
                                                            <strong>Chapitre:</strong> {availableChapters.find(c => c.value === form.values.chapterId?.toString())?.label}
                                                        </Text>
                                                    </Group>
                                                )}
                                                <Group>
                                                    <IconTarget size={16} style={{ color: '#ff8cc8' }} />
                                                    <Text size="sm">
                                                        <strong>Seuil de réussite:</strong> {form.values.successPercentage}%
                                                    </Text>
                                                </Group>
                                            </Stack>
                                        </Paper>
                                    )}
                                </Stack>

                                <Group justify="space-between" mt="xl">
                                    {!isUpdating && (
                                        <Button
                                            variant="gradient"
                                            gradient={{ from: 'gray', to: 'dark' }}
                                            onClick={() => setActiveStep(1)}
                                            leftSection={<IconBookmark size={16} />}
                                        >
                                            Retour
                                        </Button>
                                    )}
                                    <Group ml="auto">
                                        <Button
                                            variant="gradient"
                                            gradient={{ from: 'red', to: 'pink' }}
                                            onClick={handleCloseModal}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="gradient"
                                            gradient={{ from: 'green', to: 'teal' }}
                                            loading={loading}
                                            leftSection={<IconPlus size={16} />}
                                        >
                                            {isUpdating ? 'Modifier' : 'Créer le quiz'}
                                        </Button>
                                    </Group>
                                </Group>
                            </Box>
                        )}
                    </Stack>
                </form>
            </Modal>

            {/* Modal de suppression */}
            <Modal
                opened={deleteOpened}
                onClose={closeDelete}
                title={
                    <Group>
                        <IconTrash size={24} color="red" />
                        <Text size="lg" fw={600} c="red">
                            Confirmer la suppression
                        </Text>
                    </Group>
                }
                size="md"
                radius="md"
            >
                <Stack gap="md">
                    <Text>
                        Êtes-vous sûr de vouloir supprimer le quiz{' '}
                        <Text component="span" fw={600}>
                            "{selectedQuiz?.title}"
                        </Text>
                        ? Cette action est irréversible.
                    </Text>

                    <Group justify="flex-end">
                        <Button 
                            variant="gradient"
                            gradient={{ from: 'gray', to: 'dark' }}
                            onClick={closeDelete}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="gradient"
                            gradient={{ from: 'red', to: 'pink' }}
                            onClick={handleDelete}
                            loading={loading}
                            leftSection={<IconTrash size={16} />}
                        >
                            Supprimer
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box>
    );
}