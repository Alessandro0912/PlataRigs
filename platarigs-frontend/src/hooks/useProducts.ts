import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, type Product } from '../lib/api/products';
import { toast } from 'sonner';

export const useProducts = (filters?: Parameters<typeof productApi.getProducts>[0]) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produkt erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen des Produkts');
      console.error('Error creating product:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produkt erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren des Produkts');
      console.error('Error updating product:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produkt erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen des Produkts');
      console.error('Error deleting product:', error);
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productApi.updateQuantity(id, quantity),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      toast.success('Bestand erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Aktualisieren des Bestands: ${error.message}`);
    },
  });
}; 