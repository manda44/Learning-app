import {create} from 'zustand';
type BreadCrumb = {
      title: string;
      href: string;
}

type GeneralState= {
      breadCrumb: BreadCrumb[];
      setBreadCrumb: (breadCrumb: BreadCrumb[])=>void;
}

export const useGeneralStore = create<GeneralState>((set) => ({
      breadCrumb: [],
      setBreadCrumb: (breadCrumb:BreadCrumb[]) => set({ breadCrumb }),
}));