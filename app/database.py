from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from app.config import settings

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# For SQLite, we need to add check_same_thread=False
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Supabase client
supabase = None
if hasattr(settings, 'SUPABASE_URL') and hasattr(settings, 'SUPABASE_KEY') and settings.SUPABASE_URL and settings.SUPABASE_KEY:
    from supabase import create_client, Client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency to get Supabase client
def get_supabase():
    return supabase
