import { supabase } from '../supabase';

export type Product = {
  id: string;
  name: string;
  description: string;
  category: 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling' | 'other';
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  min_quantity: number;
  created_at: string;
  updated_at: string;
};

export const productApi = {
  // Get all products with optional filters
  getProducts: async (filters?: {
    category?: Product['category'];
    condition?: Product['condition'];
    search?: string;
    lowStock?: boolean;
  }) => {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.lowStock) {
      query = query.lte('quantity', supabase.raw('min_quantity'));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Product[];
  },

  // Get a single product by ID
  getProduct: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Create a new product
  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Update a product
  updateProduct: async ({ id, updates }: {
    id: string;
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
  }) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Delete a product
  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update product quantity
  updateQuantity: async (id: string, quantity: number) => {
    const { data, error } = await supabase
      .from('products')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
}; 