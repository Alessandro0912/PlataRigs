import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi, type Task } from '../lib/api/tasks';
import { toast } from 'sonner';

export const useTasks = (filters?: Parameters<typeof taskApi.getTasks>[0]) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getTasks(filters),
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen der Aufgabe');
      console.error('Error creating task:', error);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren der Aufgabe');
      console.error('Error updating task:', error);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen der Aufgabe');
      console.error('Error deleting task:', error);
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      taskApi.updateTaskStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast.success('Status erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Aktualisieren des Status: ${error.message}`);
    },
  });
};

export const useReassignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      taskApi.reassignTask(id, assignedTo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast.success('Aufgabe erfolgreich neu zugewiesen');
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Neuzuweisen: ${error.message}`);
    },
  });
}; 