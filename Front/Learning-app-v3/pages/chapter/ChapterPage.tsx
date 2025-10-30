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
      ColorPicker
} from '@mantine/core';
import {
      IconPlus,
      IconSearch,
      IconLayoutGrid,
      IconLayoutList,
} from '@tabler/icons-react';
 import {chapterStates} from "../../hooks/chapter/chapterStates";
 import {useChapterAction} from "../../hooks/chapter/chapterActions";
 import ChapterCardElement from "../../components/Chapter/ChapterCardElement"


const ChapterPage = () =>{
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    
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
                >
                </TextInput>
                <Textarea
                    label="Description"
                    withAsterisk
                    key={form.key('description')}
                    {...form.getInputProps('description')}
                    rows={4}
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
                    <Button onClick={close} color="red">Annuler</Button>
                    <form onSubmit={form.onSubmit(onSubmitForm)}>
                        <Button type="submit">Valider</Button>
                    </form>
                </Group>
            </Modal>
            <Paper shadow="lg" radius="md" withBorder p="md">
                <Group justify="center">
                    <Select
                        searchable
                        leftSection={<IconSearch size={16} />}
                        placeholder="Rechercher..."
                        data={optionsArray}
                        value={selectedValue}
                        onChange={setSelectedValue}
                        w={250}
                        radius="xl"
                    />
                    <Button
                        onClick={async() => {
                            if (selectedValue !== null) {
                                await fetchChapters(Number(selectedValue));
                            }
                        }}
                        radius="xl"
                    >
                        Valider
                    </Button>
                </Group>
            </Paper>
            <Paper shadow="md" radius="md" withBorder mt="sm" p="md" style={{ minHeight: 'calc(100vh - 120px)', marginBottom: 16 }}>
                <Grid gutter="md">
                    <Grid.Col span={4}>
                        <Group>
                            <ActionIcon variant="filled">
                                <IconLayoutGrid />
                            </ActionIcon>
                            <ActionIcon variant="light">
                                <IconLayoutList />
                            </ActionIcon>
                            <Select
                                data={[
                                    { value: 'date', label: 'Date' },
                                    { value: 'name', label: 'Nom' },
                                ]}
                                placeholder="Trier par"
                                variant="unstyled"
                            />
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={1} offset={7}>
                        <Button
                         radius="xl"
                          leftSection={<IconPlus size={18}/>}
                           w={150}
                           onClick={()=>{open();setIsUpdating(false)}}
                          >Ajouter</Button>
                    </Grid.Col>
                </Grid>
                <Grid gutter="xl">
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
            </Paper>
        </>
    )
}

export default ChapterPage;