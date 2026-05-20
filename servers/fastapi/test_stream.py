import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from api.v1.ppt.endpoints.presentation import stream_presentation
from models.sql.presentation import PresentationModel
import uuid
import sys
import logging

try:
    from database import get_async_session, DATABASE_URL
except:
    DATABASE_URL = "sqlite+aiosqlite:///./database.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def test_stream(presentation_id_str):
    presentation_id = uuid.UUID(presentation_id_str)
    try:
        async with async_session() as session:
            resp = await stream_presentation(presentation_id, session)
            print("Response:", type(resp))
            
            # Start the streamer to see if inner() throws immediately
            import traceback
            async for chunk in resp.body_iterator:
                print(chunk)
                break
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(test_stream(sys.argv[1]))
