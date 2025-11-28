import os
from tavily import TavilyClient
from bs4 import BeautifulSoup
import re

def clean_text(text: str) -> str:
    """
    Preprocess and clean extracted text.
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?;:()\-\'"]+', '', text)
    # Remove multiple consecutive punctuation
    text = re.sub(r'([.,!?;:]){2,}', r'\1', text)
    return text.strip()

def scrape_website(url: str, max_pages: int = 5) -> str:
    """
    Scrapes a website using Tavily API with two-step approach:
    1. Use map() to discover all URLs on the website
    2. Use extract() for each discovered URL
    3. Preprocess and combine all content
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise ValueError("TAVILY_API_KEY not found in environment variables")

    try:
        tavily = TavilyClient(api_key=api_key)
        
        # Step 1: Use map to discover all URLs on the website
        print(f"�️  Step 1: Mapping website to discover URLs: {url}")
        map_response = tavily.map(url=url)
        
        if not map_response or "urls" not in map_response:
            print(f"⚠️  Map returned no URLs, falling back to main URL only")
            urls_to_scrape = [url]
        else:
            urls_to_scrape = map_response["urls"][:max_pages]
            print(f"📄 Discovered {len(urls_to_scrape)} URLs to scrape")
        
        # Step 2: Extract content from each discovered URL
        all_content = []
        for idx, page_url in enumerate(urls_to_scrape, 1):
            print(f"📥 Step 2: Extracting content from page {idx}/{len(urls_to_scrape)}: {page_url}")
            try:
                extract_response = tavily.extract(urls=[page_url])
                
                if extract_response and "results" in extract_response and extract_response["results"]:
                    result = extract_response["results"][0]
                    raw_content = result.get("raw_content", "")
                    
                    if raw_content:
                        # Clean up with BeautifulSoup
                        soup = BeautifulSoup(raw_content, "html.parser")
                        
                        # Remove unwanted elements
                        for element in soup(["script", "style", "nav", "footer", "header", "aside", "iframe"]):
                            element.decompose()
                        
                        # Extract text
                        text = soup.get_text()
                        
                        # Break into lines and remove leading/trailing space
                        lines = (line.strip() for line in text.splitlines())
                        # Break multi-headlines into a line each
                        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                        # Drop blank lines
                        page_text = '\n'.join(chunk for chunk in chunks if chunk)
                        
                        if page_text:
                            all_content.append(f"=== Content from: {page_url} ===\n{page_text}\n")
                            print(f"✅ Extracted {len(page_text)} characters from {page_url}")
                    else:
                        print(f"⚠️  No raw_content in extract response for {page_url}")
                else:
                    print(f"⚠️  Empty extract response for {page_url}")
                    
            except Exception as e:
                print(f"⚠️  Failed to extract from {page_url}: {e}")
                continue
        
        if not all_content:
            raise Exception("No content could be extracted from any pages")
        
        # Step 3: Combine and preprocess all content
        combined_content = "\n\n".join(all_content)
        cleaned_content = clean_text(combined_content)
        
        print(f"✅ Successfully scraped {len(all_content)} page(s), total length: {len(cleaned_content)} characters")
        return cleaned_content

    except Exception as e:
        print(f"❌ Error scraping website: {e}")
        raise e
