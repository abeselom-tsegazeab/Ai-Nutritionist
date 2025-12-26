import pandas as pd
import os

# 1. Setup file names
# Windows sometimes hides the .csv extension, but pandas needs it.
food_file = 'food.csv'
nutrient_file = 'food_nutrient.csv'

print("--- STARTING DATA CLEANING ---")

# 2. Load the Food Names
if os.path.exists(food_file):
    print(f"Loading {food_file}...")
    # encoding='latin1' helps prevent errors with special characters
    foods = pd.read_csv(food_file, encoding='latin1')
else:
    print(f"ERROR: Could not find {food_file}. Make sure this script is in the same folder.")
    exit()

# 3. Load the Nutrient Data (The Big File)
if os.path.exists(nutrient_file):
    print(f"Loading {nutrient_file}... (This might take a few seconds)")
    nutrients = pd.read_csv(nutrient_file, encoding='latin1')
else:
    print(f"ERROR: Could not find {nutrient_file}.")
    exit()

# 4. Filter for specific Macro Nutrients
# We only want: Calories (1008), Protein (1003), Fat (1004), Carbs (1005)
target_ids = [1008, 1003, 1004, 1005]
filtered = nutrients[nutrients['nutrient_id'].isin(target_ids)]

# 5. Pivot: Turn rows into columns
print("Organizing data...")
pivot = filtered.pivot_table(
    index='fdc_id', 
    columns='nutrient_id', 
    values='amount'
).reset_index()

# 6. Rename columns to be human-readable
pivot.rename(columns={
    1008: 'calories',
    1003: 'protein',
    1004: 'fat',
    1005: 'carbs'
}, inplace=True)

# 7. Merge Food Names with Nutrient Data
print("Merging names with numbers...")
final_df = pd.merge(pivot, foods[['fdc_id', 'description']], on='fdc_id', how='left')

# 8. Clean up (Fill empty values with 0, reorder columns)
final_df.fillna(0, inplace=True)
final_df = final_df[['description', 'calories', 'protein', 'fat', 'carbs']]

# 9. Save the result
output_file = 'final_ingredients.csv'
final_df.to_csv(output_file, index=False)

print(f"✅ DONE! Saved clean data to: {output_file}")
print(f"Total foods processed: {len(final_df)}")