import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, type User } from '../lib/api/users';
import { toast } from 'sonner';

export const useUsers = (filters?: Parameters<typeof userApi.getUsers>[0]) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getUsers(filters),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Benutzerrolle erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren der Benutzerrolle');
      console.error('Error updating user role:', error);
    },
  });
}; 