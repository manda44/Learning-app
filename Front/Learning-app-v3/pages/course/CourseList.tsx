import type { Course } from "../../types/Course";
import { getCourseList, createCourse, getCourseById, updateCourse, deleteCourse,searchCourse } from '../../services/courseService';
import { useEffect, useState } from "react";
import {
      Container,
      Button,
      Modal,
      TextInput,
      ActionIcon,
      Group,
      Stack
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form"
import {
      IconPlus,
      IconPencil,
      IconTrash
} from '@tabler/icons-react';
import { format } from 'date-fns';
import {useModalStore} from "../../store/modalStore";
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import {useGeneralStore} from "../../store/generalStore";


const CourseList = () =>{
      
      const [courses, setCourses] = useState<Course[]>([]);
      const [opened,{open, close}] = useDisclosure(false);
      const [isUpdating, setIsUpdating] = useState(false);
      const [courseIdUpdate, setCourseIdUpdate] = useState(0);
      const {showModal} = useModalStore();
      const [page, setPage] = useState(1);
      const [totalRecords,setTotalRecords] = useState(0);
      const  [pageSize,setPageSize] = useState(10);
      const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Course>>({
            columnAccessor: 'courseId',
            direction: 'asc',
          });
      const [fetching, setFetching] = useState(false);
      const [searchQuery,setSearchQuery] = useState('');
      const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);
      const breadCurmbs = [
            {
                  title:'Cours & contenus',
                  href:'/course'
            },
            {
                  title:'Cours',
                  href:'/course'
            }
      ]
      setBreadCrumb(breadCurmbs as any);


      const fetchCourses = async () => {
            setFetching(true);
            try{
                  let courseList : Course[] = [];
                  if (searchQuery && searchQuery.trim() !== ""){
                        courseList = await searchCourse(searchQuery);
                  }
                  else{
                        courseList = await getCourseList();
                  }
                  setTotalRecords(courseList.length);
                  let sorted = sortBy(courseList, sortStatus.columnAccessor as keyof Course);
                  sorted = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
                  const from = (page - 1) * pageSize;
                  const to = from + pageSize;
                  setCourses(sorted.slice(from, to));
            }
            catch(error){
                  showModal('error', 'Une erreur est survenue lors de l\'operation');
                  console.log(error);
            }
            setFetching(false);
      };

      const addCourse = async (course: Course) => {``
            try {
                  await createCourse(course);
                  fetchCourses();
                  showModal('success','Cours inséré avec succès !');
            }
            catch(error){
                  showModal('error','Une erreur est survenue lors de l\'operation')
                  console.log(error);
            }
      }
      const handleUpdateCourse = async (course: Course) => {
            try {
                  await updateCourse(courseIdUpdate,course);
                  fetchCourses();
                  showModal('success', 'Cours modifié avec succès !');
            }
            catch(error){
                  showModal('error', 'Une erreur est survenue lors de l\'operation')
                  console.log(error);
            }
      }

      const handleDelete = async (courseId: number) => {
            try{
                  await deleteCourse(courseId);
                  fetchCourses();
                  showModal('success', 'Cours supprimé avec succès !');
                  close();
            }
            catch(error){     
                  showModal('error', 'Une erreur est survenue lors de l\'operation')
                  console.log(error);
            }
      }

      const handleClose = () => {
            if(isUpdating)
                  form.reset();
            close();
      };

      const openModalOnUpdate = async (courseId : number) => {
            let toUpdate: Course = await getCourseById(courseId);
            setCourseIdUpdate(courseId);
            form.setFieldValue('title', toUpdate.title);
            form.setFieldValue('description', toUpdate.description);
            setIsUpdating(true);
            open();
      }

      useEffect(() => {     
            fetchCourses();
      }, [page,sortStatus,pageSize,searchQuery]);
      const searchForm = useForm({
            mode:'uncontrolled',
            initialValues:{
                  query:'',
            }
      })
      const form = useForm({
            mode:'uncontrolled',
            initialValues:{
                  title:'',
                  description:'',
                  courseId : 0
            },
            validate:(values)=>({
                  title:
                        values.title.length === 0
                        ?'Le titre est obligatoire'
                        : values.title.length < 2
                              ? 'Le titre doit contenir au moins 2 caractères'
                              : null,
                  description:
                        values.description.length === 0
                        ?'La description est obligatoire'
                        : values.description.length < 2
                        ? 'La description doit contenir au moins 2 caractères'
                        : null
            })
      });

      function onSubmitForm(values:any){
            if(isUpdating){
                  values.courseId = courseIdUpdate;
                  console.log(values);
                  handleUpdateCourse(values).then(()=>{
                        setIsUpdating(false);
                        form.reset();
                        close();
                  })
            }
            else
                  addCourse(values);
            form.reset();
            close();
      }

      function setPageSizeFooter(pageSize:any){
            setPageSize(pageSize);
            setPage(1);
      }

      function handleclickSearch(values:any){
            setSearchQuery(values.query);
      }

      const datatableColumns = [
            {
                  accessor: 'title',
                  title: 'Titre',
                  sortable: true
            },
            {
                  accessor: 'description',
                  title: 'Déscription',
                  sortable: true
            },
            {
                  accessor: 'createdAt',
                  title: 'Date de création',
                  sortable: true,
                  render:({createdAt}:{createdAt:Date}) => format(new Date(createdAt), 'dd/MM/yyyy HH:mm')
            },
            {
                  accessor: 'updatedAt',
                  title: 'Date de modification',
                  sortable: true,
                  render: ({ updatedAt }: { updatedAt: Date }) => format(new Date(updatedAt), 'dd/MM/yyyy HH:mm')
            },
            {
                  accessor:'action',
                  title:'Action',
                  render: ({ courseId }: { courseId: number }) => (
                        <>
                              <ActionIcon
                                    color='green'
                                    onClick={() => openModalOnUpdate(courseId)}
                                    aria-label="modifier"
                                    variant='subtle'
                              >
                                    <IconPencil size={22} />
                              </ActionIcon>
                              <ActionIcon
                                    color='red'
                                    onClick={() => handleDelete(courseId)}
                                    aria-label="supprimer"
                                    variant='subtle'
                              >
                                    <IconTrash size={22} />
                              </ActionIcon>
                        </>
                  )

            }
            
      ]

      return(
            <>
                  <Button
                        mb={'md'}
                        leftSection={<IconPlus size={14} />}
                        onClick={()=>{setIsUpdating(false); open()}
                  }>Ajouter</Button>
                  <Group mb='md'>
                        <TextInput
                              placeholder="search"
                              key={searchForm.key('query')}
                              {...searchForm.getInputProps('query')}
                        />
                        <form onSubmit={searchForm.onSubmit(handleclickSearch)}>
                              <Button type="submit">Rechercher</Button>
                        </form>
                  </Group>
                  <Modal opened={opened} onClose={handleClose} title={isUpdating ? 'Modifier un cours' : 'Ajouter un cours'}>
                        <TextInput
                              label ="Titre"
                              withAsterisk
                              key={form.key('title')}
                              {...form.getInputProps('title')}
                        >
                        </TextInput>
                        <TextInput
                              label="Description"
                              withAsterisk
                              key= {form.key('descritpion')}
                              {...form.getInputProps('description')}
                        >
                        </TextInput>
                        <Group mt='md' justify="flex-end">
                              <Button onClick={close} color="red">Annuler</Button>
                              <form onSubmit={form.onSubmit(onSubmitForm)}>
                                    <Button type="submit">Valider</Button>
                              </form>
                        </Group>
                  </Modal>
                  <DataTable
                        columns={datatableColumns}
                        records={courses}
                        totalRecords={totalRecords}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        fetching={fetching}
                  />
                  <Stack>
                        <p style={{ marginBottom: '0px' }}>Nombre d'élement par page:</p>
                        <Group gap='xs'>
                              <Button
                                    onClick={() => setPageSizeFooter(10)}
                                    variant={pageSize === 10 ? 'filled' : 'subtle'}
                              >10</Button>
                              <Button
                                    onClick={() => setPageSizeFooter(30)}
                                    variant={pageSize === 30 ? 'filled' : 'subtle'}>30</Button>
                              <Button
                                    onClick={() => setPageSizeFooter(100)}
                                    variant={pageSize === 100 ? 'filled' : 'subtle'}
                              >100</Button>
                        </Group>
                  </Stack>
            </>
      )
}

export default CourseList