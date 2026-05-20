import os
import asyncio
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

async def main():
    client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    try:
        models = await client.models.list()
        print([m.id for m in models.data])
    except Exception as e:
        print(f"Error listing models: {e}")

asyncio.run(main())
