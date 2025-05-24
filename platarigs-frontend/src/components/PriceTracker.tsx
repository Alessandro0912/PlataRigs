import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface ProductTracking {
  id: string;
  name: string;
  manufacturer: string;
  model_number: string;
  ean: string;
  search_terms: string[];
  created_at: string;
}

interface PriceHistory {
  id: string;
  product_tracking_id: string;
  shop_name: string;
  price: number;
  currency: string;
  url: string;
  in_stock: boolean;
  shipping_cost: number | null;
  shipping_time: string | null;
  created_at: string;
  product_tracking: ProductTracking;
}

export function PriceTracker() {
  const [products, setProducts] = useState<ProductTracking[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    manufacturer: '',
    model_number: '',
    ean: '',
    search_terms: [''] as string[]
  });
  const { toast } = useToast();
  const [triggeringScraper, setTriggeringScraper] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchPriceHistory();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError('Fehler beim Laden der Produkte');
      console.error('Error fetching products:', err);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('*, product_tracking!inner(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPriceHistory(data || []);
    } catch (err) {
      setError('Fehler beim Laden der Preishistorie');
      console.error('Error fetching price history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('product_tracking')
        .insert([{
          ...newProduct,
          search_terms: newProduct.search_terms.filter(term => term.trim() !== '')
        }]);

      if (error) throw error;

      setNewProduct({
        name: '',
        manufacturer: '',
        model_number: '',
        ean: '',
        search_terms: ['']
      });
      fetchProducts();
    } catch (err) {
      setError('Fehler beim Hinzufügen des Produkts');
      console.error('Error adding product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      setError('Fehler beim Löschen des Produkts');
      console.error('Error deleting product:', err);
    }
  };

  const handleAddSearchTerm = () => {
    setNewProduct(prev => ({
      ...prev,
      search_terms: [...prev.search_terms, '']
    }));
  };

  const handleSearchTermChange = (index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      search_terms: prev.search_terms.map((term, i) => i === index ? value : term)
    }));
  };

  const handleRemoveSearchTerm = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      search_terms: prev.search_terms.filter((_, i) => i !== index)
    }));
  };

  const handleTriggerScraper = async () => {
    try {
      setTriggeringScraper(true);
      const response = await fetch('/api/trigger-scraper', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger scraper');
      }

      toast({
        title: 'Scraper gestartet',
        description: 'Die Preissuche wurde erfolgreich gestartet.',
      });

      // Wait a bit and then refresh the price history
      setTimeout(fetchPriceHistory, 5000);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Der Scraper konnte nicht gestartet werden.',
        variant: 'destructive',
      });
    } finally {
      setTriggeringScraper(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preistracking</CardTitle>
              <CardDescription>
                Fügen Sie Produkte hinzu, deren Preise Sie überwachen möchten
              </CardDescription>
            </div>
            <Button
              onClick={handleTriggerScraper}
              disabled={triggeringScraper}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${triggeringScraper ? 'animate-spin' : ''}`} />
              Preise aktualisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Produktname</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Hersteller</Label>
                <Input
                  id="manufacturer"
                  value={newProduct.manufacturer}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, manufacturer: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modellnummer</Label>
                <Input
                  id="model"
                  value={newProduct.model_number}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, model_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ean">EAN</Label>
                <Input
                  id="ean"
                  value={newProduct.ean}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, ean: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Suchbegriffe</Label>
              {newProduct.search_terms.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={term}
                    onChange={(e) => handleSearchTermChange(index, e.target.value)}
                    placeholder="Suchbegriff"
                    required
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveSearchTerm(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSearchTerm}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Suchbegriff hinzufügen
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Produkt hinzufügen
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produkte</CardTitle>
              <CardDescription>
                Liste der überwachten Produkte
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchProducts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Hersteller</TableHead>
                <TableHead>Modell</TableHead>
                <TableHead>EAN</TableHead>
                <TableHead>Suchbegriffe</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.manufacturer}</TableCell>
                  <TableCell>{product.model_number}</TableCell>
                  <TableCell>{product.ean}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.search_terms.map((term, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preishistorie</CardTitle>
              <CardDescription>
                Letzte Preisaktualisierungen
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchPriceHistory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Versand</TableHead>
                <TableHead>Lieferzeit</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.product_tracking.name}</TableCell>
                  <TableCell>
                    <a
                      href={price.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {price.shop_name}
                    </a>
                  </TableCell>
                  <TableCell>
                    {price.price.toFixed(2)} {price.currency}
                  </TableCell>
                  <TableCell>
                    {price.shipping_cost
                      ? `${price.shipping_cost.toFixed(2)} ${price.currency}`
                      : 'Kostenlos'}
                  </TableCell>
                  <TableCell>{price.shipping_time || '-'}</TableCell>
                  <TableCell>
                    {new Date(price.created_at).toLocaleString('de-DE')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 