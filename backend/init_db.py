from backend.database import Base, engine
import backend.models  # noqa: registers all models

Base.metadata.create_all(bind=engine)
print("Tables created in subsense.db")