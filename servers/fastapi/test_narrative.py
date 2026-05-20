import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the server path to sys.path
BASE_DIR = '/Users/ganesh/Downloads/presenton-0.5.18-beta/servers/fastapi'
sys.path.append(BASE_DIR)

# Load environment variables
load_dotenv(os.path.join(BASE_DIR, '.env'))

from utils.llm_calls.generate_narrative_approaches import generate_narrative_approaches

async def test():
    prompt = "Latest AI trends 2024"
    print(f"Testing narrative generation for: {prompt}")
    print(f"Model: {os.getenv('ANTHROPIC_MODEL')}")
    try:
        approaches = await generate_narrative_approaches(prompt)
        if not approaches:
            print("\nFAILURE: No approaches generated.")
        else:
            print(f"\nSUCCESS! Generated {len(approaches)} approaches:")
            for i, a in enumerate(approaches, 1):
                print(f"{i}. {a.get('title')}: {a.get('description')}")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
