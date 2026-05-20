from duckduckgo_search import DDGS
import json

def Nobel prize winners():
    with DDGS() as ddgs:
        print("Starting search...")
        results = [r for r in ddgs.text("Nobel prize winners", max_results=5)]
        print(f"Results type: {type(results)}")
        print(f"Count: {len(results)}")
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    Nobel prize winners()
