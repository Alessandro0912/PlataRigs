import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildApi, type Build, type BuildComponent } from '../lib/api/builds';
import { toast } from 'sonner';

export const useBuilds = (filters?: Parameters<typeof buildApi.getBuilds>[0]) => {
  return useQuery({
    queryKey: ['builds', filters],
    queryFn: () => buildApi.getBuilds(filters),
  });
};

export const useBuild = (id: string) => {
  return useQuery({
    queryKey: ['builds', id],
    queryFn: () => buildApi.getBuild(id),
    enabled: !!id,
  });
};

export const useCreateBuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildApi.createBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      toast.success('Build erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen des Builds');
      console.error('Error creating build:', error);
    },
  });
};

export const useUpdateBuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildApi.updateBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      toast.success('Build erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren des Builds');
      console.error('Error updating build:', error);
    },
  });
};

export const useDeleteBuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildApi.deleteBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      toast.success('Build erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen des Builds');
      console.error('Error deleting build:', error);
    },
  });
};

export const useAddBuildComponents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildApi.addBuildComponents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      toast.success('Komponenten erfolgreich hinzugefügt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Hinzufügen der Komponenten');
      console.error('Error adding components:', error);
    },
  });
};

export const useRemoveBuildComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildApi.removeBuildComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      toast.success('Komponente erfolgreich entfernt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Entfernen der Komponente');
      console.error('Error removing component:', error);
    },
  });
}; 