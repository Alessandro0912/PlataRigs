import { supabase } from '../supabase';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
  updated_at: string;
};

export const userApi = {
  // Get all users with optional filters
  getUsers: async (filters?: {
    role?: User['role'];
    search?: string;
  }) => {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        email:auth.users!id(email)
      `)
      .order('name');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,auth.users.email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as User[];
  },

  // Get a single user by ID
  getUser: async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        email:auth.users!id(email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as User;
  },

  // Update a user's role
  updateUserRole: async ({ id, role }: {
    id: string;
    role: User['role'];
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },
}; 