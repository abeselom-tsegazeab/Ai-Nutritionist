from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.schemas import MealPlanCreate
from database.database import get_db
from ai.generator import generate_meal_plan


router = APIRouter(prefix="/mealplan", tags=["Meal Plan"])

@router.post("/")
async def create_meal_plan(request: MealPlanCreate, db: Session = Depends(get_db)):
    result = await generate_meal_plan(request)
    return {"meal_plan": result}

