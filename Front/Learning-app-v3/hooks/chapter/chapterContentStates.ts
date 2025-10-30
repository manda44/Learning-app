/* eslint-disable */
import { useState } from "react";
import type { Chapter } from "../../types/Chapter";
import { useGeneralStore } from "../../store/generalStore";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { fr } from "@blocknote/core/locales";
import { codeBlock } from "@blocknote/code-block";
import { useNavigate } from "react-router-dom";


export default function chapterContentStates(){
    const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);
    const [content, setContent] = useState({});
    const [chapters, setChapters] = useState<Chapter[]>([])
    const editor = useCreateBlockNote({
        dictionary: fr,
        codeBlock,
    });
    const navigate = useNavigate();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [chapterTitle, setChapterTitle] = useState("");
    const [originalTitle, setOriginalTitle] = useState("");

    
    return{
        setBreadCrumb,content,setContent,chapters,setChapters,
        editor,navigate,isEditingTitle,setIsEditingTitle,
        chapterTitle,setChapterTitle,originalTitle,setOriginalTitle
    }
}