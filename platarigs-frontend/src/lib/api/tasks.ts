import { supabase } from '../supabase';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string;
  created_by: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    name: string;
  };
};

export const taskApi = {
  // Get all tasks with optional filters
  getTasks: async (filters?: {
    status?: Task['status'];
    priority?: Task['priority'];
    assignedTo?: string;
    search?: string;
  }) => {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:profiles!assigned_to(id, name),
        creator:profiles!created_by(id, name)
      `)
      .order('due_date', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Task[];
  },

  // Get a single task by ID
  getTask: async (id: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:profiles!assigned_to(id, name),
        creator:profiles!created_by(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Task;
  },

  // Create a new task
  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  // Update a task
  updateTask: async ({ id, updates }: {
    id: string;
    updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>>;
  }) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  // Delete a task
  deleteTask: async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update task status
  updateTaskStatus: async (id: string, status: Task['status']) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Reassign task
  reassignTask: async (id: string, assignedTo: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        assigned_to: assignedTo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
}; 