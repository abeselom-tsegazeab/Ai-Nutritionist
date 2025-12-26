from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    mealplans = relationship("MealPlan", back_populates="owner")


class MealPlan(Base):
    __tablename__ = "mealplans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal = Column(String, nullable=False)
    diet_type = Column(String, nullable=False)
    daily_calories = Column(Integer, nullable=False)
    macro_protein = Column(Integer, nullable=False)
    macro_carbs = Column(Integer, nullable=False)
    macro_fats = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="mealplans")
    history = relationship("MealHistory", back_populates="mealplan")


class MealHistory(Base):
    __tablename__ = "mealhistory"

    id = Column(Integer, primary_key=True, index=True)
    mealplan_id = Column(Integer, ForeignKey("mealplans.id"))
    day_number = Column(Integer, nullable=False)
    meals_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    mealplan = relationship("MealPlan", back_populates="history")
