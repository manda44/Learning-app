/* eslint-disable */
import { useState } from "react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import type { Course } from "../../types/Course";
import type { Chapter } from "../../types/Chapter";
import { useModalStore } from "../../store/modalStore";
import { useGeneralStore } from "../../store/generalStore";
export function chapterStates(){
    const [courseList,setCourseList] = useState<Course[]>([]);
    const {showModal: showStatusModal} = useModalStore();
    const [chapterList,setChapterList] = useState<Chapter[]>([]);
    const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);
    const [opened, { open, close }] = useDisclosure(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const form = useForm({
                mode:'uncontrolled',
                initialValues:{
                      chapterId:0,
                      title:'',
                      description:'',
                      courseId : 0,
                      color:''
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

    return{
        courseList,
        setCourseList,
        setBreadCrumb,
        showStatusModal,
        chapterList,
        setChapterList,
        opened,
        open,
        close,
        form,
        isUpdating,
        setIsUpdating
    }
}