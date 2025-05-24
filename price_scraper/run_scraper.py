import asyncio
import os
from dotenv import load_dotenv
from main_scraper import PriceScraper

async def main():
    # Load environment variables
    load_dotenv()

    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')

    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials in environment variables")

    # Initialize scraper
    scraper = PriceScraper(supabase_url, supabase_key)
    await scraper.initialize()

    # Scrape all products
    await scraper.scrape_all_products()

    # Export to Google Sheets if configured
    spreadsheet_id = os.getenv('GOOGLE_SHEETS_ID')
    credentials_file = os.getenv('GOOGLE_CREDENTIALS_FILE')

    if spreadsheet_id and credentials_file:
        await scraper.export_to_google_sheets(spreadsheet_id, credentials_file)

if __name__ == "__main__":
    asyncio.run(main()) 