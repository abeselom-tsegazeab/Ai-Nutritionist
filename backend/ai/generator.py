from openai import OpenAI
from core.config import settings
from ai.prompt_template import PROMPT_TEMPLATE
import asyncio

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_meal_plan(request):
    prompt = PROMPT_TEMPLATE.format(
        goal=request.goal,
        calories=request.daily_calories,
        diet_type=request.diet_type,
        protein=request.macros.protein,
        carbs=request.macros.carbs,
        fats=request.macros.fats
    )

    response = await asyncio.to_thread(
        client.chat.completions.create,
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        return response.choices[0].message.content
    except (IndexError, AttributeError) as e:
        raise RuntimeError("Failed to generate meal plan: invalid response structure") from e
