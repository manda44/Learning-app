
import {useGeneralStore} from "../../store/generalStore";
import { useState } from "react";
import Mcq from "../../components/Quiz/Mcq.tsx";
import type { McqRef } from "../../components/Quiz/Mcq.tsx";
import type {UniqueChoiceRef} from "../../components/Quiz/UniqueChoice.tsx";


export function useQuizStates(){
    const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);
    const [mcqs, setMcqs] = useState<{
        data: any;
        id: number;
        rank: number;
        ref: React.RefObject<McqRef |UniqueChoiceRef| null>;
        type?: 'MCQ' | 'UNIQUECHOICE' | 'OPENRESPONSE'
    }[]>([]);

    return{
        setBreadCrumb,
        mcqs,setMcqs
    }
}