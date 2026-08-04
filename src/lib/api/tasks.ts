import api from '@/lib/axios';
import { Task } from '@/types';

export const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
};

export const createTask = async (body: Partial<Task>): Promise<Task> => {
  const { data } = await api.post<Task>('/tasks', body);
  return data;
};

export const updateTask = async ({ id, ...body }: Partial<Task> & { id: string }): Promise<Task> => {
  const { data } = await api.put<Task>(`/tasks/${id}`, body);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
