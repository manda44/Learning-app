import { useEffect, useState } from "react";
import {
      Button,
      Modal,
      TextInput,
      Textarea,
      ActionIcon,
      Group,
      Grid,
      Paper,
      Select,
      ColorPicker,
      Container,
      Stack,
      Title,
      Text,
      Table,
      Badge
} from '@mantine/core';
import {
      IconPlus,
      IconSearch,
      IconLayoutGrid,
      IconLayoutList,
      IconFilter,
      IconEdit,
      IconTrash,
      IconEye
} from '@tabler/icons-react';
 import {chapterStates} from "../../hooks/chapter/chapterStates";
 import {useChapterAction} from "../../hooks/chapter/chapterActions";
 import ChapterCardElement from "../../components/Chapter/ChapterCardElement"


const ChapterPage = () =>{
    const [selectedValue, setSelectedValue] = useState<string | null>(() => {
        const saved = localStorage.getItem('selectedCourseId');
        return saved || null;
    });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem('chapterViewMode');
        return (saved as 'grid' | 'list') || 'grid';
    });

    const {
        courseList,setCourseList, setBreadCrumb,showStatusModal,
        chapterList,setChapterList,opened,open,close,form,isUpdating,setIsUpdating
    } = chapterStates();

    const {
        fetchCourses,
        fetchChapters,
        handleClose,
        onSubmitForm,
        openEditModal,
    } = useChapterAction({
        state :{
            setCourseList,setChapterList,form,close,selectedValue,showStatusModal,isUpdating,
            setIsUpdating,open
        }
    });

    // Save selected course to localStorage when it changes
    useEffect(()=>{
        if (selectedValue) {
            localStorage.setItem('selectedCourseId', selectedValue);
            // Automatically fetch chapters when course is selected
            fetchChapters(Number(selectedValue));
        }
    }, [selectedValue])

    // Save view mode to localStorage when it changes
    useEffect(()=>{
        localStorage.setItem('chapterViewMode', viewMode);
    }, [viewMode])

    useEffect(()=>{
        const fetch = async () => await fetchCourses();
        fetch();
    },[])

    const breadCurmbs = [
        {
            title: 'Cours & contenus',
            href: '/course'
        },
        {
            title: 'Chapitres',
            href: '/chapter'
        }
    ]
    setBreadCrumb(breadCurmbs as any);

    const optionsArray = courseList.map(course =>({
        value: course.courseId.toString(),
        label: course.title
    }))


    return(
        <>
            <Modal opened={opened} onClose={handleClose} title={isUpdating ? 'Modifier chapitre' : 'Ajouter chapitre'} closeOnClickOutside={false}>
                <TextInput
                    type="hidden"
                    key={form.key('chapterId')}
                    {...form.getInputProps('chapterId')}
                    style={{ display: 'none' }}
                />
                <TextInput
                    label="Titre"
                    withAsterisk
                    key={form.key('title')}
                    {...form.getInputProps('title')}
                    placeholder="Entrez le titre du chapitre"
                >
                </TextInput>
                <Textarea
                    label="Description"
                    withAsterisk
                    key={form.key('description')}
                    {...form.getInputProps('description')}
                    rows={4}
                    placeholder="Entrez la description du chapitre"
                />
                <TextInput
                    label="couleur"
                    placeholder="#ffffff"
                    key={form.key('color')}
                    {...form.getInputProps('color')}
                    readOnly
                    mt="xs"
                    leftSection={
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                backgroundColor: form.values.color || '#ffffff',
                                borderRadius: 4,
                                border: '1px solid #ccc'
                            }}
                        />
                    }
                    rightSection={
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            onClick={() => form.setFieldValue('color', '')}
                        >
                            ✕
                        </ActionIcon>
                    }
                />
                <ColorPicker
                    format="hex"
                    swatches={['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                    value={form.values.color}
                    onChange={(color) => form.setFieldValue('color', color)}
                    withPicker={false}
                />
                <Group mt='md' justify="flex-end">
                    <Button onClick={close} color="red" variant="light">Annuler</Button>
                    <form onSubmit={form.onSubmit(onSubmitForm)}>
                        <Button type="submit">Valider</Button>
                    </form>
                </Group>
            </Modal>

            <Container size="100%" py="xl" px="lg">
                <Stack gap="xl">
                    {/* Header */}
                    <div>
                        <Title order={1} size="h2" mb="xs">Gestion des chapitres</Title>
                        <Text c="dimmed">Créez et gérez les chapitres de vos cours</Text>
                    </div>

                    {/* Course Selection Card */}
                    <Paper shadow="md" radius="lg" withBorder p="lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Group justify="space-between" align="flex-end" gap="lg">
                            <Stack gap="sm" flex={1}>
                                <Text fw={500} c="white" size="sm" tt="uppercase">Sélectionner un cours</Text>
                                <Select
                                    searchable
                                    leftSection={<IconSearch size={16} />}
                                    placeholder="Recherchez un cours..."
                                    data={optionsArray}
                                    value={selectedValue}
                                    onChange={setSelectedValue}
                                    w="100%"
                                    radius="lg"
                                    styles={{
                                        input: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none'
                                        }
                                    }}
                                />
                            </Stack>
                            <Button
                                onClick={async() => {
                                    if (selectedValue !== null) {
                                        await fetchChapters(Number(selectedValue));
                                    }
                                }}
                                radius="lg"
                                size="md"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                variant="white"
                            >
                                Charger
                            </Button>
                        </Group>
                    </Paper>

                    {/* Controls and Actions */}
                    {selectedValue && (
                        <Paper shadow="sm" radius="lg" withBorder p="lg" bg="gray.0">
                            <Group justify="space-between" align="center">
                                <Group gap="lg">
                                    <Group gap={4}>
                                        <Text fw={500} size="sm" c="dimmed">Affichage:</Text>
                                        <ActionIcon
                                            variant={viewMode === 'grid' ? 'filled' : 'light'}
                                            size="lg"
                                            title="Grille"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <IconLayoutGrid size={18} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant={viewMode === 'list' ? 'filled' : 'light'}
                                            size="lg"
                                            title="Liste"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <IconLayoutList size={18} />
                                        </ActionIcon>
                                    </Group>
                                    <Group gap={4}>
                                        <IconFilter size={18} style={{ opacity: 0.5 }} />
                                        <Select
                                            data={[
                                                { value: 'date', label: 'Date (récent)' },
                                                { value: 'name', label: 'Nom (A-Z)' },
                                            ]}
                                            placeholder="Trier par..."
                                            variant="unstyled"
                                            size="sm"
                                            w={160}
                                        />
                                    </Group>
                                </Group>
                                <Button
                                    radius="lg"
                                    leftSection={<IconPlus size={18}/>}
                                    onClick={()=>{open();setIsUpdating(false)}}
                                    size="md"
                                >Ajouter un chapitre</Button>
                            </Group>
                        </Paper>
                    )}

                    {/* Chapters Display */}
                    <div style={{ minHeight: '400px' }}>
                        {chapterList.length > 0 ? (
                            viewMode === 'grid' ? (
                                <Grid gutter="lg">
                                    {chapterList.map((chapter) => (
                                        <ChapterCardElement
                                        key={chapter.chapterId}
                                        chapterId= {chapter.chapterId}
                                        title={chapter.title}
                                        createdDate={chapter.createdAd.toString()}
                                        description={chapter.description ?? ""}
                                        color= {chapter.color}
                                        openModal = {(id: string | number) => { void openEditModal(Number(id)); }}
                                        />
                                    ))}
                                </Grid>
                            ) : (
                                <Paper shadow="sm" radius="lg" withBorder overflow="hidden">
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Titre</Table.Th>
                                                <Table.Th>Description</Table.Th>
                                                <Table.Th>Date de création</Table.Th>
                                                <Table.Th w="120px" ta="center">Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {chapterList.map((chapter) => (
                                                <Table.Tr key={chapter.chapterId}>
                                                    <Table.Td>
                                                        <Group gap={8}>
                                                            <div
                                                                style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: chapter.color || '#FFE259',
                                                                    flexShrink: 0
                                                                }}
                                                            />
                                                            <Text fw={500} size="sm">{chapter.title}</Text>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text
                                                            size="sm"
                                                            c="dimmed"
                                                            lineClamp={1}
                                                            style={{ maxWidth: '300px' }}
                                                        >
                                                            {chapter.description || 'Pas de description'}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" c="dimmed">
                                                            {new Date(chapter.createdAd).toLocaleDateString('fr-FR')}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap={4} justify="center">
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="light"
                                                                color="blue"
                                                                title="Voir le contenu"
                                                                onClick={() => {}}
                                                            >
                                                                <IconEye size={14} />
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="light"
                                                                color="gray"
                                                                title="Modifier"
                                                                onClick={() => openEditModal(Number(chapter.chapterId))}
                                                            >
                                                                <IconEdit size={14} />
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                size="sm"
                                                                variant="light"
                                                                color="red"
                                                                title="Supprimer"
                                                                onClick={() => {}}
                                                            >
                                                                <IconTrash size={14} />
                                                            </ActionIcon>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Paper>
                            )
                        ) : (
                            <Paper shadow="sm" radius="lg" p="xl" bg="gray.0" style={{ textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Stack gap="md" align="center">
                                    <Text c="dimmed" fw={500}>
                                        {selectedValue ? 'Aucun chapitre disponible' : 'Sélectionnez un cours pour afficher les chapitres'}
                                    </Text>
                                    {selectedValue && (
                                        <Button
                                            radius="lg"
                                            leftSection={<IconPlus size={18}/>}
                                            onClick={()=>{open();setIsUpdating(false)}}
                                        >Créer le premier chapitre</Button>
                                    )}
                                </Stack>
                            </Paper>
                        )}
                    </div>
                </Stack>
            </Container>
        </>
    )
}

export default ChapterPage;