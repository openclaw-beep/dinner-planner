import os
import sys

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///./test_dinner_planner.db")
sys.path.insert(0, os.path.abspath("."))

from app.db.base import Base
from app.db.session import SessionLocal, engine


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
