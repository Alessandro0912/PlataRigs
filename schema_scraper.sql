-- Create table for product tracking
CREATE TABLE IF NOT EXISTS public.product_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    manufacturer TEXT,
    model_number TEXT,
    ean TEXT,
    search_terms TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for price history
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_tracking_id UUID REFERENCES public.product_tracking(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    url TEXT,
    in_stock BOOLEAN,
    shipping_cost DECIMAL(10,2),
    shipping_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for shop configurations
CREATE TABLE IF NOT EXISTS public.shop_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    search_url_template TEXT,
    price_selector TEXT,
    stock_selector TEXT,
    shipping_selector TEXT,
    requires_proxy BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for proxy configurations
CREATE TABLE IF NOT EXISTS public.proxy_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT,
    password TEXT,
    active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxy_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view product tracking"
    ON public.product_tracking FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage product tracking"
    ON public.product_tracking FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view price history"
    ON public.price_history FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage price history"
    ON public.price_history FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view shop configs"
    ON public.shop_configs FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage shop configs"
    ON public.shop_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view proxy configs"
    ON public.proxy_configs FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage proxy configs"
    ON public.proxy_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_product_tracking_updated_at
    BEFORE UPDATE ON public.product_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_configs_updated_at
    BEFORE UPDATE ON public.shop_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 