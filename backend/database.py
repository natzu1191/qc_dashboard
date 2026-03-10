from typing import AsyncGenerator
import sqlmodel
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DB_CONNSTRING")

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"statement_cache_size": 0},  # <-- disables prepared statements
)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
if hasattr(sqlmodel.sql.sqltypes, "AutoString"):
    sqlmodel.sql.sqltypes.AutoString = lambda: sa.String()
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

# Standalone scripts — async context manager
@asynccontextmanager
async def get_db_session() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except:
            await session.rollback()
            raise