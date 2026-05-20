#!/bin/bash
export APP_DATA_DIRECTORY="$(pwd)/app_data"
source .venv/bin/activate
uvicorn api.main:app --port 8000 --reload
#./start_backend.sh





