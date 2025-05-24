# PC Component Price Scraper

Ein modularer Scraper zum automatischen Vergleichen von PC-Komponenten-Preisen verschiedener Online-Shops.

## Features

- Automatische Preissuche in verschiedenen Online-Shops
- Speicherung der Preishistorie in Supabase
- Export der Daten nach Google Sheets
- Proxy-Unterstützung für Shops mit Rate-Limiting
- Modulare Struktur für einfaches Hinzufügen neuer Shops
- Asynchrone Ausführung für schnelle Ergebnisse
- Robuste Fehlerbehandlung und Logging

## Installation

1. Python 3.8 oder höher installieren
2. Repository klonen
3. Virtuelle Umgebung erstellen und aktivieren:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```
4. Abhängigkeiten installieren:
```bash
pip install -r requirements.txt
```

## Konfiguration

1. `.env` Datei erstellen:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_CREDENTIALS_FILE=path/to/credentials.json
```

2. Supabase Datenbank einrichten:
   - SQL-Schema aus `schema_scraper.sql` ausführen
   - Shop-Konfigurationen in der `shop_configs` Tabelle hinzufügen
   - Proxy-Konfigurationen in der `proxy_configs` Tabelle hinzufügen (optional)

3. Google Sheets API einrichten (optional):
   - Google Cloud Console Projekt erstellen
   - Google Sheets API aktivieren
   - Service Account erstellen und JSON-Credentials herunterladen
   - Credentials-Datei im Projektverzeichnis speichern
   - Google Sheet erstellen und ID kopieren

## Verwendung

1. Produkte zum Tracking hinzufügen:
```sql
INSERT INTO product_tracking (name, manufacturer, model_number, ean, search_terms)
VALUES ('RTX 4080', 'NVIDIA', 'RTX4080', '1234567890123', ARRAY['RTX 4080', 'NVIDIA RTX 4080']);
```

2. Scraper ausführen:
```bash
python run_scraper.py
```

3. Automatische Ausführung einrichten (Linux/Mac):
```bash
# Crontab bearbeiten
crontab -e

# Tägliche Ausführung um 8 Uhr
0 8 * * * cd /path/to/scraper && ./venv/bin/python run_scraper.py
```

## Neue Shops hinzufügen

1. Neue Scraper-Klasse erstellen:
```python
from base_scraper import BaseScraper

class NewShopScraper(BaseScraper):
    def __init__(self, config):
        super().__init__(config)
        self.base_url = "https://shop-url.com"
        self.search_url_template = "https://shop-url.com/search?q={query}"

    async def search_product(self, search_terms):
        # Implementierung der Produktsuche
        pass

    async def get_product_details(self, product_url):
        # Implementierung der Produktdetails
        pass
```

2. Shop-Konfiguration in Supabase hinzufügen:
```sql
INSERT INTO shop_configs (name, base_url, search_url_template, price_selector, stock_selector, shipping_selector, requires_proxy, active)
VALUES ('new_shop', 'https://shop-url.com', 'https://shop-url.com/search?q={query}', '.price', '.stock', '.shipping', false, true);
```

3. Scraper in `main_scraper.py` registrieren:
```python
from .new_shop_scraper import NewShopScraper

# In der initialize Methode:
if config['name'] == 'new_shop':
    self.scrapers[config['name']] = NewShopScraper(config)
```

## Fehlerbehebung

- Logs in `scraper.log` überprüfen
- Proxy-Konfiguration bei Rate-Limiting anpassen
- Shop-Selektoren bei Änderungen der Website aktualisieren
- Google Sheets API-Berechtigungen überprüfen

## Lizenz

MIT 