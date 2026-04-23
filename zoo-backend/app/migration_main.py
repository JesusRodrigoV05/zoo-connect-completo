from fastapi import FastAPI, APIRouter
app = FastAPI()
router = APIRouter()
@app.get("/")
def read_root():
    return {"status": "migration_mode"}
app.include_router(router)
