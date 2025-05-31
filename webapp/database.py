# webapp/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import json

CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../config/db_config.json"))

def load_db_config():
    if not os.path.exists(CONFIG_PATH):
        return None
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

cfg = load_db_config()
if not cfg:
    raise Exception("❌ DB config not found. Please configure it via Admin Settings.")

db_type = cfg.get("db_type")
user = cfg.get("user")
password = cfg.get("password")
host = cfg.get("host")
port = cfg.get("port")
db_name = cfg.get("db_name")

if db_type == "sqlserver":
    SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc://{user}:{password}@{host}:{port}/{db_name}?driver=ODBC+Driver+17+for+SQL+Server"
elif db_type == "mysql":
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
elif db_type == "sqlite":
    SQLALCHEMY_DATABASE_URL = f"sqlite:///./{db_name}.db"
else:
    raise Exception("❌ Unsupported DB type")

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
