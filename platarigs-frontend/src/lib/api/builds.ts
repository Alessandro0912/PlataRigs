import { supabase } from '../supabase';

export type Build = {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  total_cost: number;
  selling_price: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type BuildComponent = {
  id: string;
  build_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export const buildApi = {
  // Get all builds with optional filters
  getBuilds: async (filters?: {
    status?: Build['status'];
    search?: string;
  }) => {
    let query = supabase
      .from('builds')
      .select(`
        *,
        build_components (
          *,
          product:products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as (Build & { build_components: (BuildComponent & { product: any })[] })[];
  },

  // Get a single build by ID
  getBuild: async (id: string) => {
    const { data, error } = await supabase
      .from('builds')
      .select(`
        *,
        build_components (
          *,
          product:products (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Build & { build_components: (BuildComponent & { product: any })[] };
  },

  // Create a new build
  createBuild: async (build: Omit<Build, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('builds')
      .insert([build])
      .select()
      .single();

    if (error) throw error;
    return data as Build;
  },

  // Update a build
  updateBuild: async ({ id, updates }: {
    id: string;
    updates: Partial<Omit<Build, 'id' | 'created_at' | 'updated_at'>>;
  }) => {
    const { data, error } = await supabase
      .from('builds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Build;
  },

  // Delete a build
  deleteBuild: async (id: string) => {
    const { error } = await supabase
      .from('builds')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add components to a build
  addBuildComponents: async ({ buildId, components }: {
    buildId: string;
    components: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }) => {
    const { data, error } = await supabase
      .from('build_components')
      .insert(
        components.map(component => ({
          build_id: buildId,
          ...component,
        }))
      )
      .select();

    if (error) throw error;
    return data as BuildComponent[];
  },

  // Remove a component from a build
  removeBuildComponent: async ({ buildId, componentId }: {
    buildId: string;
    componentId: string;
  }) => {
    const { error } = await supabase
      .from('build_components')
      .delete()
      .eq('id', componentId)
      .eq('build_id', buildId);

    if (error) throw error;
  },
}; 