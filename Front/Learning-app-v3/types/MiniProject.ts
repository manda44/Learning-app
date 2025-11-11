export interface Ticket {
  ticketId: number;
  miniProjectId: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  courseId: number;
  title: string;
}

export interface MiniProject {
  miniProjectId: number;
  title: string;
  description: string;
  courseId: number;
  course?: Course;
  createdAt: Date;
  updatedAt: Date;
  tickets?: Ticket[];
}
