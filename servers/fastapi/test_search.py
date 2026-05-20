import asyncio
from utils.search_utils import execute_web_search_async

async def main():
    print("Testing web search...")
    results = await execute_web_search_async("Nobel prize 2024 winners")
    print(f"Results: {results}")

if __name__ == "__main__":
    asyncio.run(main())
