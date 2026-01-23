#!/usr/bin/env python3
"""
Script to delete all users from the database
This will also cascade delete related meal plans and meal history
"""

from database.database import engine, get_db
from database.models import Base, User, MealPlan, MealHistory
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

def delete_all_users():
    """Delete all users and related data from the database"""
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("Starting deletion process...")
        
        # Count users before deletion
        user_count = db.query(User).count()
        mealplan_count = db.query(MealPlan).count()
        mealhistory_count = db.query(MealHistory).count()
        
        print(f"Current counts:")
        print(f"  Users: {user_count}")
        print(f"  Meal Plans: {mealplan_count}")
        print(f"  Meal History entries: {mealhistory_count}")
        
        if user_count == 0:
            print("No users found in database. Nothing to delete.")
            return
        
        # Confirm deletion
        print(f"\nDeleting ALL {user_count} users and their related data...")
        # Auto-confirm for this operation
        confirmation = 'YES'
        
        # Delete in correct order to handle foreign key constraints
        print("\nDeleting meal history...")
        deleted_history = db.query(MealHistory).delete()
        print(f"Deleted {deleted_history} meal history entries")
        
        print("Deleting meal plans...")
        deleted_mealplans = db.query(MealPlan).delete()
        print(f"Deleted {deleted_mealplans} meal plans")
        
        print("Deleting users...")
        deleted_users = db.query(User).delete()
        print(f"Deleted {deleted_users} users")
        
        # Commit all deletions
        db.commit()
        
        print("\n✅ Deletion completed successfully!")
        print("Database is now empty of user data.")
        
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    delete_all_users()