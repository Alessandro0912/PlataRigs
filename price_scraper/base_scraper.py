from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import logging
import aiohttp
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin

class BaseScraper(ABC):
    def __init__(self, config: Dict[str, Any], proxy: Optional[Dict[str, Any]] = None):
        self.config = config
        self.proxy = proxy
        self.session = None
        self.logger = logging.getLogger(self.__class__.__name__)

    async def __aenter__(self):
        self.session = await self._create_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def _create_session(self) -> aiohttp.ClientSession:
        """Create an aiohttp session with proxy if configured."""
        if self.proxy:
            proxy_url = f"http://{self.proxy['host']}:{self.proxy['port']}"
            if self.proxy.get('username') and self.proxy.get('password'):
                proxy_url = f"http://{self.proxy['username']}:{self.proxy['password']}@{self.proxy['host']}:{self.proxy['port']}"
            
            return aiohttp.ClientSession(
                headers=self._get_headers(),
                proxy=proxy_url
            )
        return aiohttp.ClientSession(headers=self._get_headers())

    def _get_headers(self) -> Dict[str, str]:
        """Get default headers for requests."""
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
        }

    async def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch a page with retry logic and error handling."""
        max_retries = 3
        retry_delay = 1

        for attempt in range(max_retries):
            try:
                async with self.session.get(url, timeout=30) as response:
                    if response.status == 200:
                        return await response.text()
                    elif response.status == 429:  # Too Many Requests
                        retry_delay *= 2
                        self.logger.warning(f"Rate limited, waiting {retry_delay}s before retry")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        self.logger.error(f"HTTP {response.status} for {url}")
                        return None
            except asyncio.TimeoutError:
                self.logger.warning(f"Timeout on attempt {attempt + 1} for {url}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                continue
            except Exception as e:
                self.logger.error(f"Error fetching {url}: {str(e)}")
                return None

        return None

    def _extract_price(self, text: str) -> Optional[float]:
        """Extract price from text, handling different formats."""
        if not text:
            return None

        # Remove currency symbols and whitespace
        text = re.sub(r'[^\d,.]', '', text.strip())
        
        # Handle German number format (1.234,56)
        if ',' in text:
            text = text.replace('.', '').replace(',', '.')
        
        try:
            return float(text)
        except ValueError:
            return None

    def _extract_shipping_cost(self, text: str) -> Optional[float]:
        """Extract shipping cost from text."""
        return self._extract_price(text)

    @abstractmethod
    async def search_product(self, search_terms: list) -> list:
        """Search for a product and return list of results."""
        pass

    @abstractmethod
    async def get_product_details(self, url: str) -> Dict[str, Any]:
        """Get detailed product information from a product page."""
        pass

    async def scrape_product(self, search_terms: list) -> Optional[Dict[str, Any]]:
        """Main method to scrape product information."""
        try:
            # Search for the product
            search_results = await self.search_product(search_terms)
            if not search_results:
                return None

            # Get details for the first result
            product_url = search_results[0]['url']
            details = await self.get_product_details(product_url)
            
            if not details:
                return None

            return {
                'shop_name': self.config['name'],
                'price': details['price'],
                'currency': details.get('currency', 'EUR'),
                'url': product_url,
                'in_stock': details.get('in_stock', True),
                'shipping_cost': details.get('shipping_cost'),
                'shipping_time': details.get('shipping_time'),
                'created_at': datetime.utcnow()
            }

        except Exception as e:
            self.logger.error(f"Error scraping product: {str(e)}")
            return None 