from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.lifespan import app_lifespan
from api.middlewares import UserConfigEnvUpdateMiddleware
from api.v1.ppt.router import API_V1_PPT_ROUTER
from api.v1.webhook.router import API_V1_WEBHOOK_ROUTER
from api.v1.mock.router import API_V1_MOCK_ROUTER


app = FastAPI(lifespan=app_lifespan)


# Routers
app.include_router(API_V1_PPT_ROUTER)
app.include_router(API_V1_WEBHOOK_ROUTER)
app.include_router(API_V1_MOCK_ROUTER)

# Middlewares
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(UserConfigEnvUpdateMiddleware)

# Serve generated images and other app_data assets
_images_dir = os.path.join("app_data", "images")
os.makedirs(_images_dir, exist_ok=True)
app.mount("/app_data/images", StaticFiles(directory=_images_dir), name="app_data_images")

_fonts_dir = os.path.join("app_data", "fonts")
if os.path.isdir(_fonts_dir):
    app.mount("/app_data/fonts", StaticFiles(directory=_fonts_dir), name="app_data_fonts")
