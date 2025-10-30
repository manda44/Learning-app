export interface Ticket {
  ticketId: number;
  miniProjectId: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MiniProject {
  miniProjectId: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tickets?: Ticket[];
}
