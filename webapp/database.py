import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from urllib.parse import quote_plus
from contextlib import contextmanager

user = os.getenv("DB_USERNAME", "sa")
password = quote_plus(os.getenv("DB_PASSWORD", "SA4sql2019!"))
server = os.getenv("DB_SERVER", "10.164.135.240")
database = os.getenv("DB_NAME", "DVAReporter")

SQLALCHEMY_DATABASE_URL = (
    f"mssql+pyodbc://{user}:{password}@{server}:1433/{database}"
    "?driver=ODBC+Driver+17+for+SQL+Server&Encrypt=no&TrustServerCertificate=yes"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()