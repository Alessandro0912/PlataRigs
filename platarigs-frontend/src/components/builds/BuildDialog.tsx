import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Build, BuildComponent } from '@/lib/api/builds';
import { useCreateBuild, useUpdateBuild, useAddBuildComponents, useRemoveBuildComponent } from '@/hooks/useBuilds';
import { useProducts } from '@/hooks/useProducts';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

const buildSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed']),
  total_cost: z.number().min(0),
  selling_price: z.number().min(0),
});

type BuildFormValues = z.infer<typeof buildSchema>;

interface BuildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  build?: Build & { build_components?: BuildComponent[] };
}

export default function BuildDialog({ open, onOpenChange, build }: BuildDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [components, setComponents] = useState<BuildComponent[]>(build?.build_components || []);

  const form = useForm<BuildFormValues>({
    resolver: zodResolver(buildSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      total_cost: 0,
      selling_price: 0,
    },
  });

  const { data: products } = useProducts();
  const createBuild = useCreateBuild();
  const updateBuild = useUpdateBuild();
  const addComponents = useAddBuildComponents();
  const removeComponent = useRemoveBuildComponent();

  useEffect(() => {
    if (build) {
      form.reset({
        name: build.name,
        description: build.description,
        status: build.status,
        total_cost: build.total_cost,
        selling_price: build.selling_price,
      });
      setComponents(build.build_components || []);
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'draft',
        total_cost: 0,
        selling_price: 0,
      });
      setComponents([]);
    }
  }, [build, form]);

  const handleAddComponent = () => {
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newComponent: BuildComponent = {
      id: '',
      build_id: build?.id || '',
      product_id: product.id,
      quantity,
      unit_price: product.selling_price,
      created_at: new Date().toISOString(),
    };

    setComponents([...components, newComponent]);
    setSelectedProductId('');
    setQuantity(1);

    // Update total cost
    const totalCost = components.reduce((sum, comp) => sum + comp.unit_price * comp.quantity, 0)
      + newComponent.unit_price * newComponent.quantity;
    form.setValue('total_cost', totalCost);
    form.setValue('selling_price', Math.ceil(totalCost * 1.2)); // 20% margin by default
  };

  const handleRemoveComponent = async (index: number) => {
    const component = components[index];
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);

    // Update total cost
    const totalCost = newComponents.reduce((sum, comp) => sum + comp.unit_price * comp.quantity, 0);
    form.setValue('total_cost', totalCost);
    form.setValue('selling_price', Math.ceil(totalCost * 1.2));

    if (build && component.id) {
      try {
        await removeComponent.mutateAsync({
          buildId: build.id,
          componentId: component.id,
        });
      } catch (error) {
        console.error('Error removing component:', error);
      }
    }
  };

  const onSubmit = async (values: BuildFormValues) => {
    try {
      if (build) {
        await updateBuild.mutateAsync({
          id: build.id,
          updates: values,
        });
      } else {
        const newBuild = await createBuild.mutateAsync({
          ...values,
          created_by: 'current_user_id', // TODO: Get from auth context
        });

        if (components.length > 0) {
          await addComponents.mutateAsync({
            buildId: newBuild.id,
            components: components.map(comp => ({
              product_id: comp.product_id,
              quantity: comp.quantity,
              unit_price: comp.unit_price,
            })),
          });
        }
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving build:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{build ? 'Build bearbeiten' : 'Neuer Build'}</DialogTitle>
          <DialogDescription>
            {build
              ? 'Bearbeite die Details des Builds'
              : 'Erstelle einen neuen PC-Build'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
                      <SelectItem value="draft">Entwurf</SelectItem>
                      <SelectItem value="in_progress">In Arbeit</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <FormLabel>Komponente</FormLabel>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Komponente auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.selling_price.toFixed(2)} €
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <FormLabel>Anzahl</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddComponent}
                  disabled={!selectedProductId}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Hinzufügen
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Komponente</TableHead>
                      <TableHead className="text-right">Anzahl</TableHead>
                      <TableHead className="text-right">Einzelpreis</TableHead>
                      <TableHead className="text-right">Gesamt</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.map((component, index) => {
                      const product = products?.find(p => p.id === component.product_id);
                      if (!product) return null;

                      return (
                        <TableRow key={index}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">{component.quantity}</TableCell>
                          <TableCell className="text-right">
                            {component.unit_price.toFixed(2)} €
                          </TableCell>
                          <TableCell className="text-right">
                            {(component.unit_price * component.quantity).toFixed(2)} €
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveComponent(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gesamtkosten (€)</FormLabel>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                {build ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 