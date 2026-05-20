from dotenv import load_dotenv
import os
load_dotenv()

from utils.get_env import get_web_grounding_env
from utils.parsers import parse_bool_or_none

def check():
    val = get_web_grounding_env()
    parsed = parse_bool_or_none(val)
    print(f"WEB_GROUNDING raw: {val}")
    print(f"WEB_GROUNDING parsed: {parsed}")

if __name__ == "__main__":
    check()
