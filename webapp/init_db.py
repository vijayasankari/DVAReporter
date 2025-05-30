from webapp.models import Base
from webapp.database import engine

# This creates all tables
Base.metadata.create_all(bind=engine)
print("✅ Tables created.")
