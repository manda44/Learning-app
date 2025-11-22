import type { Course } from "../../types/Course";
import type { User } from "../../types/User";
import {
      getUserList,
      createUser,
      getUserById,
      updateUser,
      deleteUser,
      searchUsers,
      disableUser,
      enableUser
 } from '../../services/userService';
import {getRoleList } from '../../services/roleService';
import { useEffect, useState } from "react";
import {
      Container,
      Button,
      Modal,
      TextInput,
      ActionIcon,
      Group,
      Stack,
      Select,
      Badge,
      MultiSelect,
      Title,
      Switch
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form"
import {
      IconPlus,
      IconPencil,
      IconTrash
} from '@tabler/icons-react';
import { format } from 'date-fns';
import {useConfirmModalStore, useModalStore} from "../../store/modalStore";
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import {useGeneralStore} from "../../store/generalStore";
import { IconPhoto, IconDownload } from '@tabler/icons-react';
import type { Role } from "../../types/Role";


interface RoleItem{
      value:string;
      label:string
}

export default function UserList(){
     
      //#region states
      const [tableState, setTableState] = useState<{
            usersList: User[];
            recordNumber: number;
      }>({
            usersList: [],
            recordNumber: 0
      });

      const[opened, {open,close}] = useDisclosure(false);
      const[modalState, setModalState] = useState<{
            title: string;
            isUpdating:boolean;
            userIdtoUpdate:number;
      }>({
            title:'Ajouter Utilisateur',
            isUpdating:false,
            userIdtoUpdate: 0
      })
      const { setAction, showModal } = useConfirmModalStore();
      const {showModal: showStatusModal} = useModalStore();
      const [totalRecords, setTotalRecords] = useState(0);
      const [pageSize, setPageSize] = useState(10);
      const [sortStatus, setSortStatus] = useState<DataTableSortStatus<User>>({
            columnAccessor: 'courseId',
            direction: 'asc',
      });
      const [fetching, setFetching] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');
      const [page, setPage] = useState(1);
      //#endregion

      //#region variables & initializations
      const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);
      const breadCurmbs = [
            {
                  title:'Utilisateurs & roles',
                  href:'/user'
            },
            {
                  title:'Utilisateurs',
                  href:'/user'
            }
      ]
      setBreadCrumb(breadCurmbs as any);
      const tableColumns = [
            {
                  accessor: 'lastName' as keyof User,
                  title: 'Nom',
                  sortable: true
            },
            {
                  accessor: 'firstName' as keyof User,
                  title: 'Prénom',
                  sortable: true
            },
            {
                  accessor: 'email' as keyof User,
                  title: 'mail',
                  sortable: true
            },
            {
                  accessor: 'creationDate' as keyof User,
                  title: 'Date création',
                  sortable: true,
                  render: (user: User) => format(new Date(user.creationDate), 'dd/MM/yyyy HH:mm')
            },
            {
                  accessor: 'roles' as keyof User,
                  title: 'Roles',
                  render: (user: User) => (
                        <>
                              {user.roles?.map((role: Role, index: number) => (
                                    <Badge key={index} variant="light" color="blue">
                                          {role.name}
                                    </Badge>
                              ))}
                        </>
                  )
            },
            {
                  accessor: 'statut' as keyof User,
                  title: 'Statut',
                  render: (user: User) => (
                        <Switch
                              checked={user.isActive}  // adjust to your boolean or status check
                              onChange={async (event) => {
                                    // TODO: replace with real handler to update user status
                                    if(event.currentTarget.checked) await handleEnableUser(user.userId);
                                    else await handleDisableUser(user.userId);
                                    fetchUsers();
                                    // console.log('toggle status for user', user.userId, event.currentTarget.checked);
                              }}
                        />
                  ),
            },
            {
                  accessor: 'Action',
                  title: 'Action',
                  render: (user: User) => (
                        <>
                              <ActionIcon
                                    color='green'
                                    onClick={() => openModalOnUpdate(user.userId)}
                                    aria-label="modifier"
                                    variant='subtle'
                              >
                                    <IconPencil size={22} />
                              </ActionIcon>
                              <ActionIcon
                                    color='red'
                                    onClick={() => handleDelete(user.userId)}
                                    aria-label="supprimer"
                                    variant='subtle'
                              >
                                    <IconTrash size={22} />
                              </ActionIcon>
                        </>
                  )
            }
      ]
      const form = useForm({
            mode:'uncontrolled',
            initialValues:{
                  firstName:'',
                  lastName:'',
                  email:'',
                  roleIds: []
            },
            validate: {
                  firstName: (value) => value.length < 2 ? 'Le prénom doit contenir au moins 2 caractères' : null,
                  lastName: (value) => value.length < 2 ? 'Le nom doit contenir au moins 2 caractères' : null,
                  email: (value) => !/^\S+@\S+$/.test(value) ? 'Email invalide' : null,
                  roleIds: (value) => value.length === 0 ? 'Sélectionnez au moins un rôle' : null,
            }
      })
      const searchForm = useForm({
            mode:'uncontrolled',
            initialValues:{
                  query:'',
            }
      })
      const[roles, setRoles] = useState<RoleItem[]>([])
      //#endregion

      //#region functions
      const fetchUsers = async () => {
            setFetching(true);
            try {
                  let response : User[] = []
                  if (searchQuery && searchQuery.trim() !== "") {
                        response = await searchUsers(searchQuery);
                  }
                  else {
                        response = await getUserList();
                        console.table(response);
                  } 
                  setTableState({
                        ...tableState,
                        usersList: response
                  });
                  setTotalRecords(response.length);
                  let sorted = sortBy(response, sortStatus.columnAccessor as keyof User);
                  sorted = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
                  const from = (page - 1) * pageSize;
                  const to = from + pageSize;
                  setTableState({
                        ...tableState,
                        usersList: sorted.slice(from, to)
                  });
            } catch (error) {
                  showStatusModal('error', 'Une erreur est survenue lors de l\'operation')
                  console.error("Error fetching users:", error);
            }
            setFetching(false);
      }

      const fetchRoles  = async() =>{
            try{
                  const response = await getRoleList();
                  setRoles(response.map(r => ({value:r.roleId.toString(),label:r.name})))
            }catch(error){
                  console.error("error fetching roles:",error);
            }
      }

      const InsertUser = async (userData: User) => {
            try {
                  console.log(userData);
                  // Map to expected API shape
                  const payload = {
                        FirstName: userData.firstName,
                        LastName: userData.lastName,
                        Email: userData.email,
                        roleIds: userData.roleIds?.map(id => Number(id))
                  };
                  const newUser = await createUser(payload);
                  fetchUsers();
                  close(); // Close the modal after successful creation
                  showStatusModal('success', 'Opération réussie');
            } catch (error) {
                  showStatusModal('error', 'Une erreur est survenue lors de l\'operation');
                  console.error("Error creating user:", error);
            }
      }
      const UpdateUser = async (userId:number,userData: User) => {
            try {
                  // console.log(userData);
                  // Map to expected API shape
                  const payload = {
                        FirstName: userData.firstName,
                        LastName: userData.lastName,
                        Email: userData.email,
                        roleIds: userData.roleIds?.map(id => Number(id))
                  };
                  await updateUser(userId, payload);
                  fetchUsers();
                  close(); // Close the modal after successful creation
                  showStatusModal('success', 'Opération réussie');
            } catch (error) {
                  showStatusModal('error', 'Une erreur est survenue lors de l\'operation');
                  console.error("Error updating user:", error);
            }
      }
      const getUser = async (userId:number) => {
            try {
                  // Assuming createUser is a function that sends a POST request to create a user
                  const user = await getUserById(userId);
                  fetchUsers();
                  return user;
            } catch (error) {
                  console.error("Error creating user:", error);
            }
      }
      const handleDisableUser = async (userId:number) => {
            try {
                  // Assuming createUser is a function that sends a POST request to create a user
                  const user = await disableUser(userId);
                  return user;
            } catch (error) {
                  console.error("Error disabling user:", error);
            }
      }
      const handleEnableUser = async (userId:number) => {
            try {
                  // Assuming createUser is a function that sends a POST request to create a user
                  const user = await enableUser(userId);
                  return user;
            } catch (error) {
                  console.error("Error enabling user:", error);
            }
      }
      const handleDelete= async(userId:number)=>{
            const callback = async()=>{
                  try {
                        const user = await deleteUser(userId);
                        fetchUsers();
                        showStatusModal('success', 'Opération réussie');
                        return user;
                  } catch (error) {
                        showStatusModal('error', 'Une erreur est survenue lors de l\'operation')
                        console.error("Error deleting user:", error);
                  }
            }
            setAction(callback);
            showModal("voulez-vous supprimer?");
            
      }
      

      const onSubmitForm = (values:User)=>{
            if(modalState.isUpdating){
                  const callback= () => UpdateUser(modalState.userIdtoUpdate,values);
                  close();
                  setAction(callback);
                  showModal("Voulez-vous mettre à jour l' élément?")
                  
            }
            else {
                  const callback = () => InsertUser(values);
                  close();
                  setAction(callback);
                  showModal("Voulez-vous ajouter un nouvel élément?")
            }
            form.reset();
      }

      const openModalOnUpdate = async (userId:number)=>{
            const user = await getUser(userId);
            console.log(user);
            form.setValues({
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                  email:user?.email,
                  roleIds: user?.roles?.map(role => role.roleId.toString())
            })
            open()
            setModalState({
                  userIdtoUpdate: userId,
                  title:"Modifier Utilisateur",
                  isUpdating:true
            });
      }
       function setPageSizeFooter(pageSize:any){
            setPageSize(pageSize);
            setPage(1);
      }
      function handleclickSearch(values:any){
            setSearchQuery(values.query);
      }
      //#endregion

      //#region useEffects
      useEffect(()=>{
            fetchUsers();
            fetchRoles();
      },[page,sortStatus,pageSize,searchQuery])
      //#endregion

      return (
            <>
                  <Button leftSection={<IconPlus />} mb="md" onClick={
                        ()=>{
                              open();
                              setModalState({...modalState,title:"Ajouter Utilisateur",isUpdating:false})
                        }}>
                        Ajouter
                  </Button>
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
                  <DataTable
                        columns={tableColumns}
                        records={tableState.usersList}
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
                  {/* Modal */}
                  <Modal opened={opened} onClose={close} title={modalState.title} closeOnClickOutside={false}>

                        <TextInput
                              label="Nom"
                              key={form.key('lastName')}
                              {...form.getInputProps('lastName')}
                              withAsterisk
                        />
                        <TextInput
                              label="Prénom"
                              key={form.key('firstName')}
                              {...form.getInputProps('firstName')}
                              withAsterisk
                        />
                        <TextInput
                              label="email"
                              key={form.key('email')}
                              {...form.getInputProps('email')}
                              withAsterisk
                        />
                        <MultiSelect
                              label= "Rôle"
                              placeholder="choisir.."
                              data={roles}
                              withAsterisk
                              {...form.getInputProps('roleIds')}
                              key={form.key('roleId')}
                        />
                         <Group mt='md' justify="flex-end">
                              <Button onClick={close} color="red">Annuler</Button>
                              <form onSubmit={form.onSubmit(onSubmitForm)}>
                                    <Button type="submit">Valider</Button>
                              </form>
                        </Group>
                  </Modal>
                  {/* Fin Modal */}
                  
            </>
  );
}

