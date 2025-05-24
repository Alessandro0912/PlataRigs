import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from supabase import create_client, Client
from .geizhals_scraper import GeizhalsScraper

class PriceScraper:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.logger = logging.getLogger(__name__)
        self.scrapers = {}
        self._setup_logging()

    def _setup_logging(self):
        """Configure logging."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('scraper.log'),
                logging.StreamHandler()
            ]
        )

    async def initialize(self):
        """Initialize scrapers from database configuration."""
        try:
            # Fetch shop configurations
            response = await self.supabase.table('shop_configs').select('*').eq('active', True).execute()
            shop_configs = response.data

            # Initialize scrapers
            for config in shop_configs:
                if config['name'] == 'geizhals':
                    self.scrapers[config['name']] = GeizhalsScraper(config)
                # Add more scrapers here as they are implemented

            self.logger.info(f"Initialized {len(self.scrapers)} scrapers")

        except Exception as e:
            self.logger.error(f"Error initializing scrapers: {str(e)}")
            raise

    async def get_proxy(self) -> Optional[Dict[str, Any]]:
        """Get an available proxy from the database."""
        try:
            response = await self.supabase.table('proxy_configs')\
                .select('*')\
                .eq('active', True)\
                .order('last_used')\
                .limit(1)\
                .execute()

            if response.data:
                proxy = response.data[0]
                # Update last_used timestamp
                await self.supabase.table('proxy_configs')\
                    .update({'last_used': datetime.utcnow().isoformat()})\
                    .eq('id', proxy['id'])\
                    .execute()
                return proxy
            return None

        except Exception as e:
            self.logger.error(f"Error getting proxy: {str(e)}")
            return None

    async def scrape_product(self, product_tracking_id: str) -> Optional[Dict[str, Any]]:
        """Scrape prices for a specific product from all configured shops."""
        try:
            # Get product tracking information
            response = await self.supabase.table('product_tracking')\
                .select('*')\
                .eq('id', product_tracking_id)\
                .single()\
                .execute()

            if not response.data:
                self.logger.error(f"Product tracking not found: {product_tracking_id}")
                return None

            product = response.data
            search_terms = product['search_terms']
            
            # Get proxy if needed
            proxy = await self.get_proxy() if any(s.config.get('requires_proxy', False) for s in self.scrapers.values()) else None

            # Scrape from all shops concurrently
            tasks = []
            for scraper in self.scrapers.values():
                tasks.append(scraper.scrape_product(search_terms))

            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Filter out errors and None results
            valid_results = [r for r in results if r is not None and not isinstance(r, Exception)]

            if not valid_results:
                self.logger.warning(f"No valid results found for product {product_tracking_id}")
                return None

            # Find the best price
            best_result = min(valid_results, key=lambda x: x['price'])

            # Save to price history
            await self.supabase.table('price_history').insert({
                'product_tracking_id': product_tracking_id,
                **best_result
            }).execute()

            return best_result

        except Exception as e:
            self.logger.error(f"Error scraping product {product_tracking_id}: {str(e)}")
            return None

    async def scrape_all_products(self):
        """Scrape prices for all tracked products."""
        try:
            # Get all active product tracking entries
            response = await self.supabase.table('product_tracking')\
                .select('id')\
                .execute()

            product_ids = [p['id'] for p in response.data]

            # Scrape each product
            for product_id in product_ids:
                await self.scrape_product(product_id)
                # Add delay between products to avoid rate limiting
                await asyncio.sleep(5)

        except Exception as e:
            self.logger.error(f"Error in scrape_all_products: {str(e)}")
            raise

    async def export_to_google_sheets(self, spreadsheet_id: str, credentials_file: str):
        """Export price history to Google Sheets."""
        try:
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build
            from googleapiclient.errors import HttpError

            # Get price history data
            response = await self.supabase.table('price_history')\
                .select('*, product_tracking!inner(*)')\
                .order('created_at', desc=True)\
                .execute()

            if not response.data:
                self.logger.warning("No price history data to export")
                return

            # Prepare data for Google Sheets
            credentials = Credentials.from_service_account_file(
                credentials_file,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )

            service = build('sheets', 'v4', credentials=credentials)
            sheet = service.spreadsheets()

            # Prepare headers and data
            headers = ['Product', 'Shop', 'Price', 'Currency', 'In Stock', 'Shipping Cost', 'Shipping Time', 'Date']
            rows = [headers]

            for item in response.data:
                rows.append([
                    item['product_tracking']['name'],
                    item['shop_name'],
                    str(item['price']),
                    item['currency'],
                    str(item['in_stock']),
                    str(item['shipping_cost'] or ''),
                    item['shipping_time'] or '',
                    item['created_at']
                ])

            # Update sheet
            range_name = 'A1'
            body = {
                'values': rows
            }

            sheet.values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()

            self.logger.info(f"Successfully exported {len(rows)-1} price records to Google Sheets")

        except Exception as e:
            self.logger.error(f"Error exporting to Google Sheets: {str(e)}")
            raise 