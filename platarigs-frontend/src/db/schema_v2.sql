-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_build_components_updated_at ON public.build_components;
DROP TRIGGER IF EXISTS update_builds_updated_at ON public.builds;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing tables (in correct order due to dependencies)
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.build_components;
DROP TABLE IF EXISTS public.builds;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    role TEXT CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create builds table
CREATE TABLE IF NOT EXISTS public.builds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    created_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create build_components junction table
CREATE TABLE IF NOT EXISTS public.build_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id),
    build_id UUID REFERENCES public.builds(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products are editable by admins" ON public.products;
DROP POLICY IF EXISTS "Builds are viewable by authenticated users" ON public.builds;
DROP POLICY IF EXISTS "Builds are editable by assigned users or admins" ON public.builds;
DROP POLICY IF EXISTS "Build components are viewable by authenticated users" ON public.build_components;
DROP POLICY IF EXISTS "Build components are editable by users who can edit the build" ON public.build_components;
DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON public.tasks;
DROP POLICY IF EXISTS "Tasks are editable by assigned users, creators or admins" ON public.tasks;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Products are viewable by authenticated users" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Products are editable by admins" ON public.products
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Builds policies
CREATE POLICY "Builds are viewable by authenticated users" ON public.builds
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Builds are editable by assigned users or admins" ON public.builds
    FOR ALL USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Build components policies
CREATE POLICY "Build components are viewable by authenticated users" ON public.build_components
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Build components are editable by users who can edit the build" ON public.build_components
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM builds 
            WHERE builds.id = build_components.build_id 
            AND (
                builds.created_by = auth.uid() OR 
                builds.assigned_to = auth.uid() OR
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

-- Tasks policies
CREATE POLICY "Tasks are viewable by authenticated users" ON public.tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Tasks are editable by assigned users, creators or admins" ON public.tasks
    FOR ALL USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at
    BEFORE UPDATE ON public.builds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_build_components_updated_at
    BEFORE UPDATE ON public.build_components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (NEW.id, NEW.email, 'employee');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 