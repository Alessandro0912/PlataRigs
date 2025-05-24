from typing import Optional, Dict, Any, List
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper
import re

class GeizhalsScraper(BaseScraper):
    def __init__(self, config: Dict[str, Any], proxy: Optional[Dict[str, Any]] = None):
        super().__init__(config, proxy)
        self.base_url = "https://geizhals.de"
        self.search_url = f"{self.base_url}/?fs="

    async def search_product(self, search_terms: list) -> List[Dict[str, Any]]:
        """Search for a product on Geizhals."""
        search_query = "+".join(search_terms)
        url = f"{self.search_url}{search_query}"
        
        html = await self._fetch_page(url)
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        results = []

        # Find all product listings
        product_items = soup.select('div.productlist__item')
        
        for item in product_items:
            try:
                # Get product name and URL
                name_elem = item.select_one('div.productlist__productname a')
                if not name_elem:
                    continue

                name = name_elem.text.strip()
                url = urljoin(self.base_url, name_elem['href'])

                # Get price
                price_elem = item.select_one('span.gh_price')
                if not price_elem:
                    continue

                price = self._extract_price(price_elem.text)
                if not price:
                    continue

                results.append({
                    'name': name,
                    'url': url,
                    'price': price
                })

            except Exception as e:
                self.logger.error(f"Error parsing product item: {str(e)}")
                continue

        return results

    async def get_product_details(self, url: str) -> Optional[Dict[str, Any]]:
        """Get detailed product information from a Geizhals product page."""
        html = await self._fetch_page(url)
        if not html:
            return None

        soup = BeautifulSoup(html, 'html.parser')
        
        try:
            # Get price
            price_elem = soup.select_one('span.gh_price')
            if not price_elem:
                return None

            price = self._extract_price(price_elem.text)
            if not price:
                return None

            # Get shipping info
            shipping_info = {}
            shipping_elem = soup.select_one('div.gh_shipping_info')
            if shipping_elem:
                shipping_text = shipping_elem.text.strip()
                
                # Extract shipping cost
                shipping_cost_match = re.search(r'Versandkosten:?\s*([\d.,]+)\s*€', shipping_text)
                if shipping_cost_match:
                    shipping_info['shipping_cost'] = self._extract_price(shipping_cost_match.group(1))

                # Extract shipping time
                shipping_time_match = re.search(r'Lieferzeit:?\s*([^€\n]+)', shipping_text)
                if shipping_time_match:
                    shipping_info['shipping_time'] = shipping_time_match.group(1).strip()

            # Check stock status
            stock_elem = soup.select_one('div.gh_stock_info')
            in_stock = True
            if stock_elem:
                stock_text = stock_elem.text.strip().lower()
                in_stock = 'nicht verfügbar' not in stock_text and 'ausverkauft' not in stock_text

            return {
                'price': price,
                'currency': 'EUR',
                'in_stock': in_stock,
                **shipping_info
            }

        except Exception as e:
            self.logger.error(f"Error parsing product details: {str(e)}")
            return None 