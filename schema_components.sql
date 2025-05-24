-- Create components table
CREATE TABLE components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  specs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on category for faster filtering
CREATE INDEX components_category_idx ON components(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read components
CREATE POLICY "Allow authenticated users to read components"
  ON components FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow only admins to modify components
CREATE POLICY "Allow admins to modify components"
  ON components FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insert some sample data
INSERT INTO components (name, manufacturer, category, price, specs) VALUES
  ('Intel Core i7-13700K', 'Intel', 'cpu', 399.99, '{"cores": 16, "threads": 24, "base_clock": "3.4 GHz", "boost_clock": "5.4 GHz", "tdp": "125W", "socket": "LGA 1700"}'),
  ('AMD Ryzen 9 7950X', 'AMD', 'cpu', 699.99, '{"cores": 16, "threads": 32, "base_clock": "4.5 GHz", "boost_clock": "5.7 GHz", "tdp": "170W", "socket": "AM5"}'),
  ('NVIDIA GeForce RTX 4090', 'NVIDIA', 'gpu', 1599.99, '{"memory": "24GB GDDR6X", "memory_interface": "384-bit", "boost_clock": "2.52 GHz", "tdp": "450W"}'),
  ('AMD Radeon RX 7900 XTX', 'AMD', 'gpu', 999.99, '{"memory": "24GB GDDR6", "memory_interface": "384-bit", "boost_clock": "2.3 GHz", "tdp": "355W"}'),
  ('Corsair Vengeance RGB DDR5', 'Corsair', 'ram', 199.99, '{"capacity": "32GB", "speed": "6000MHz", "timing": "CL36", "modules": "2x16GB"}'),
  ('Samsung 990 Pro', 'Samsung', 'storage', 199.99, '{"capacity": "2TB", "interface": "PCIe 4.0 x4", "read_speed": "7450 MB/s", "write_speed": "6900 MB/s"}'),
  ('Corsair RM850x', 'Corsair', 'psu', 149.99, '{"wattage": "850W", "efficiency": "80+ Gold", "modular": "Full"}'),
  ('NZXT H7 Flow', 'NZXT', 'case', 129.99, '{"form_factor": "ATX Mid Tower", "material": "Steel/Tempered Glass", "expansion_slots": "7"}'); 