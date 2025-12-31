from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.schemas import MealPlanCreate, MealPlanResponse, MealPlanFullResponse
from database.database import get_db
from database.models import MealPlan, MealHistory, User
from ai.generator import generate_meal_plan
from ai.pdf_generator import generate_meal_plan_pdf
from routers.auth import get_current_user
from routers.auth import is_user_admin
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
    
    from database.schemas import MealPlanResponse, MealHistoryResponse
    
    history = db.query(MealHistory).filter(
        MealHistory.mealplan_id == mealplan_id
    ).all()
    
    # Convert to response models to ensure proper serialization
    mealplan_response = MealPlanResponse(
        id=meal_plan.id,
        goal=meal_plan.goal,
        diet_type=meal_plan.diet_type,
        daily_calories=meal_plan.daily_calories,
        macro_protein=meal_plan.macro_protein,
        macro_carbs=meal_plan.macro_carbs,
        macro_fats=meal_plan.macro_fats,
        created_at=meal_plan.created_at
    )
    
    history_responses = []
    for hist in history:
        history_response = MealHistoryResponse(
            id=hist.id,
            day_number=hist.day_number,
            meals_json=hist.meals_json,
            created_at=hist.created_at
        )
        history_responses.append(history_response)
    
    return {
        "mealplan": mealplan_response,
        "history": history_responses
    }


@router.get("/user", response_model=list[MealPlanResponse])
def get_user_meal_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from database.schemas import MealPlanResponse
    
    # Query meal plans for the current user
    meal_plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id
    ).order_by(MealPlan.created_at.desc()).all()
    
    # Convert to response models to ensure proper serialization
    response_models = []
    for plan in meal_plans:
        response_model = MealPlanResponse(
            id=plan.id,
            goal=plan.goal,
            diet_type=plan.diet_type,
            daily_calories=plan.daily_calories,
            macro_protein=plan.macro_protein,
            macro_carbs=plan.macro_carbs,
            macro_fats=plan.macro_fats,
            created_at=plan.created_at
        )
        response_models.append(response_model)
    
    return response_models


@router.get("/all", response_model=list[MealPlanResponse])
def get_all_meal_plans(
    current_user: User = Depends(is_user_admin),
    db: Session = Depends(get_db)
):
    """Get all meal plans - admin only"""
    meal_plans = db.query(MealPlan).order_by(MealPlan.created_at.desc()).all()
    
    # Convert to response models to ensure proper serialization
    response_models = []
    for plan in meal_plans:
        response_model = MealPlanResponse(
            id=plan.id,
            goal=plan.goal,
            diet_type=plan.diet_type,
            daily_calories=plan.daily_calories,
            macro_protein=plan.macro_protein,
            macro_carbs=plan.macro_carbs,
            macro_fats=plan.macro_fats,
            created_at=plan.created_at
        )
        response_models.append(response_model)
    
    return response_models


@router.delete("/{mealplan_id}")
def delete_meal_plan(
    mealplan_id: int,
    current_user: User = Depends(is_user_admin),
    db: Session = Depends(get_db)
):
    """Delete a meal plan - admin only"""
    meal_plan = db.query(MealPlan).filter(
        MealPlan.id == mealplan_id
    ).first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    db.delete(meal_plan)
    db.commit()
    
    return {"message": "Meal plan deleted successfully"}

