from logging.config import fileConfig
import os

from alembic import context
from sqlalchemy import create_engine, pool
from db.models.qc_case_model import QC_Case

import sqlmodel
import sqlalchemy as sa
from sqlmodel import SQLModel
from dotenv import load_dotenv

load_dotenv()
# Alembic Config
config = context.config
sqlmodel.sql.sqltypes.AutoString = lambda: sa.String()

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata
target_metadata = SQLModel.metadata

# Load DB URL (SYNC ONLY)
DATABASE_URL = os.getenv("DB_SYNC_CONNSTRING")
if not DATABASE_URL:
    raise RuntimeError("DB_SYNC_CONNSTRING is not set")


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()