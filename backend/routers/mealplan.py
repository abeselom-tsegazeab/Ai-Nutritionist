from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.schemas import MealPlanCreate, MealPlanResponse, MealPlanFullResponse
from database.database import get_db
from database.models import MealPlan, MealHistory, User
from ai.generator import generate_meal_plan
from ai.pdf_generator import generate_meal_plan_pdf
from routers.auth import get_current_user
from fastapi.responses import FileResponse
import json
import tempfile
import os


router = APIRouter(prefix="/mealplan", tags=["Meal Plan"])


@router.post("/", response_model=MealPlanResponse)
async def create_meal_plan(
    request: MealPlanCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create meal plan record in database
    db_meal_plan = MealPlan(
        user_id=current_user.id,
        goal=request.goal,
        diet_type=request.diet_type,
        daily_calories=request.daily_calories,
        macro_protein=request.macros.protein,
        macro_carbs=request.macros.carbs,
        macro_fats=request.macros.fats
    )
    
    db.add(db_meal_plan)
    db.commit()
    db.refresh(db_meal_plan)
    
    # Generate the meal plan using AI
    try:
        generated_plan = await generate_meal_plan(request)
        
        # Save the generated plan to MealHistory
        meal_history = MealHistory(
            mealplan_id=db_meal_plan.id,
            day_number=0,  # 0 indicates the full plan
            meals_json=generated_plan
        )
        
        db.add(meal_history)
        db.commit()
        
        return db_meal_plan
    except Exception as e:
        # If generation fails, remove the meal plan record
        db.delete(db_meal_plan)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate meal plan: {str(e)}"
        )


@router.get("/{mealplan_id}", response_model=MealPlanFullResponse)
def get_meal_plan(
    mealplan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal_plan = db.query(MealPlan).filter(
        MealPlan.id == mealplan_id,
        MealPlan.user_id == current_user.id
    ).first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    history = db.query(MealHistory).filter(
        MealHistory.mealplan_id == mealplan_id
    ).all()
    
    return {
        "mealplan": meal_plan,
        "history": history
    }


@router.get("/user", response_model=list[MealPlanResponse])
def get_user_meal_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal_plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id
    ).order_by(MealPlan.created_at.desc()).all()
    
    return meal_plans

