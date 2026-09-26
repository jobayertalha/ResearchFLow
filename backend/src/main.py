from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .models import Paper, Task, User  # noqa: F401 - register tables
from .routers import paper, task, user

app = FastAPI(title="ResearchFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "ResearchFlow backend is running"}


app.include_router(user.router)
app.include_router(paper.router)
app.include_router(task.router)
