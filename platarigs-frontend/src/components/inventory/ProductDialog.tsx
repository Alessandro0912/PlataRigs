import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/lib/api/products';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const categories: Product['category'][] = [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'case',
  'cooling',
  'other',
];

const conditions: Product['condition'][] = ['new', 'used', 'refurbished'];

const productSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  category: z.enum(['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling', 'other']),
  condition: z.enum(['new', 'used', 'refurbished']),
  location: z.string().min(1, 'Lagerort ist erforderlich'),
  purchase_price: z.number().min(0, 'Einkaufspreis muss größer als 0 sein'),
  selling_price: z.number().min(0, 'Verkaufspreis muss größer als 0 sein'),
  quantity: z.number().int().min(0, 'Bestand muss größer oder gleich 0 sein'),
  min_quantity: z.number().int().min(0, 'Mindestbestand muss größer oder gleich 0 sein'),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export default function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'other',
      condition: 'new',
      location: '',
      purchase_price: 0,
      selling_price: 0,
      quantity: 0,
      min_quantity: 0,
      description: '',
    },
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category,
        condition: product.condition,
        location: product.location,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        quantity: product.quantity,
        min_quantity: product.min_quantity,
        description: product.description,
      });
    } else {
      form.reset({
        name: '',
        category: 'other',
        condition: 'new',
        location: '',
        purchase_price: 0,
        selling_price: 0,
        quantity: 0,
        min_quantity: 0,
        description: '',
      });
    }
  }, [product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          updates: values,
        });
      } else {
        await createProduct.mutateAsync(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Produkt bearbeiten' : 'Neues Produkt'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Bearbeite die Details des Produkts'
              : 'Füge ein neues Produkt zum Lagerbestand hinzu'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zustand</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition === 'new'
                              ? 'Neu'
                              : condition === 'used'
                              ? 'Gebraucht'
                              : 'Refurbished'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lagerort</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einkaufspreis (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verkaufspreis (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bestand</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mindestbestand</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                {product ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 