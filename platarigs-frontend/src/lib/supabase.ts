// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxznekpadahrixiqmiwg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4em5la3BhZGFocml4aXFtaXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODA4MDIsImV4cCI6MjA2MzY1NjgwMn0.iiMxOIpOOsnkRWOlFcokyYZfFQ8N158nLzbEUwTcakQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export type Tables = {
  products: {
    id: string;
    name: string;
    category: 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling' | 'other';
    condition: 'new' | 'used' | 'refurbished';
    location: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    min_quantity: number;
    description: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
  };
  builds: {
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
  build_components: {
    id: string;
    build_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    created_at: string;
  };
  tasks: {
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
  };
};
