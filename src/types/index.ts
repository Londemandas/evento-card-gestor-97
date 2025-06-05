
export interface Event {
  id: string;
  name: string;
  logo?: string;
  date: Date;
  isArchived: boolean;
  isPriority: boolean;
  priorityOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Demand {
  id: string;
  eventId: string;
  title: string;
  subject: string;
  date: Date;
  isCompleted: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFormData {
  name: string;
  logo?: File;
  date: Date;
}

export interface DemandFormData {
  title: string;
  subject: string;
  date: Date;
}
