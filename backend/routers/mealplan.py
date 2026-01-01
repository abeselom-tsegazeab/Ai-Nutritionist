from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
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
        
        # Return as response model to ensure proper serialization
        # Use a separate query to fetch only the needed fields without relationships
        created_plan = db.execute(
            select(
                MealPlan.id,
                MealPlan.goal,
                MealPlan.diet_type,
                MealPlan.daily_calories,
                MealPlan.macro_protein,
                MealPlan.macro_carbs,
                MealPlan.macro_fats,
                MealPlan.created_at
            ).where(MealPlan.id == db_meal_plan.id)
        ).first()
        
        return MealPlanResponse(
            id=created_plan.id,
            goal=created_plan.goal,
            diet_type=created_plan.diet_type,
            daily_calories=created_plan.daily_calories,
            macro_protein=created_plan.macro_protein,
            macro_carbs=created_plan.macro_carbs,
            macro_fats=created_plan.macro_fats,
            created_at=created_plan.created_at
        )
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
    # Query only the specific columns needed to avoid relationship issues
    result = db.execute(
        select(
            MealPlan.id,
            MealPlan.goal,
            MealPlan.diet_type,
            MealPlan.daily_calories,
            MealPlan.macro_protein,
            MealPlan.macro_carbs,
            MealPlan.macro_fats,
            MealPlan.created_at
        ).where(
            MealPlan.id == mealplan_id,
            MealPlan.user_id == current_user.id
        )
    )
    meal_plan_row = result.first()
    
    if not meal_plan_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    from database.schemas import MealPlanResponse, MealHistoryResponse
    
    # Query history separately
    history_result = db.execute(
        select(
            MealHistory.id,
            MealHistory.day_number,
            MealHistory.meals_json,
            MealHistory.created_at
        ).where(MealHistory.mealplan_id == mealplan_id)
    )
    
    # Convert to response models to ensure proper serialization
    mealplan_response = MealPlanResponse(
        id=meal_plan_row.id,
        goal=meal_plan_row.goal,
        diet_type=meal_plan_row.diet_type,
        daily_calories=meal_plan_row.daily_calories,
        macro_protein=meal_plan_row.macro_protein,
        macro_carbs=meal_plan_row.macro_carbs,
        macro_fats=meal_plan_row.macro_fats,
        created_at=meal_plan_row.created_at
    )
    
    history_responses = []
    for hist in history_result:
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
    from sqlalchemy import select
    
    # Query only the specific columns needed to avoid relationship issues
    result = db.execute(
        select(
            MealPlan.id,
            MealPlan.goal,
            MealPlan.diet_type,
            MealPlan.daily_calories,
            MealPlan.macro_protein,
            MealPlan.macro_carbs,
            MealPlan.macro_fats,
            MealPlan.created_at
        ).where(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.created_at.desc())
    )
    
    # Convert rows to response models
    response_models = []
    for row in result:
        response_model = MealPlanResponse(
            id=row.id,
            goal=row.goal,
            diet_type=row.diet_type,
            daily_calories=row.daily_calories,
            macro_protein=row.macro_protein,
            macro_carbs=row.macro_carbs,
            macro_fats=row.macro_fats,
            created_at=row.created_at
        )
        response_models.append(response_model)
    
    return response_models


@router.get("/all", response_model=list[MealPlanResponse])
def get_all_meal_plans(
    current_user: User = Depends(is_user_admin),
    db: Session = Depends(get_db)
):
    """Get all meal plans - admin only"""
    from sqlalchemy import select
    
    # Query only the specific columns needed to avoid relationship issues
    result = db.execute(
        select(
            MealPlan.id,
            MealPlan.goal,
            MealPlan.diet_type,
            MealPlan.daily_calories,
            MealPlan.macro_protein,
            MealPlan.macro_carbs,
            MealPlan.macro_fats,
            MealPlan.created_at
        ).order_by(MealPlan.created_at.desc())
    )
    
    # Convert rows to response models
    response_models = []
    for row in result:
        response_model = MealPlanResponse(
            id=row.id,
            goal=row.goal,
            diet_type=row.diet_type,
            daily_calories=row.daily_calories,
            macro_protein=row.macro_protein,
            macro_carbs=row.macro_carbs,
            macro_fats=row.macro_fats,
            created_at=row.created_at
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
    # Check if meal plan exists for validation
    result = db.execute(
        select(MealPlan.id).where(MealPlan.id == mealplan_id)
    )
    meal_plan = result.first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    # Perform the deletion
    db.query(MealPlan).filter(MealPlan.id == mealplan_id).delete()
    db.commit()
    
    return {"message": "Meal plan deleted successfully"}

