import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Paper
from ..security.auth import get_current_user
from ..security.config import settings


router = APIRouter(
    prefix="/papers",
    tags=["AI Insights"],
)


# =========================================
# RESPONSE MODELS
# =========================================

class InsightResponse(BaseModel):
    headline: str
    summary: str
    priority: str
    reason: str
    suggestion: str


class NextStepResponse(BaseModel):
    task: str
    why: str
    urgency: str
    action: str


# =========================================
# PAPER ACCESS
# =========================================

def get_owned_paper(
    paper_id: int,
    db: Session,
    user_id: int,
):
    paper = (
        db.query(Paper)
        .filter(
            Paper.id == paper_id,
            Paper.user_id == user_id,
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found",
        )

    return paper


def get_user_id(current_user):
    if hasattr(current_user, "id"):
        return current_user.id

    if isinstance(current_user, dict):
        return current_user["id"]

    raise HTTPException(
        status_code=500,
        detail="Invalid authenticated user",
    )


# =========================================
# DEADLINE
# =========================================

def get_effective_deadline(paper):
    conference_deadlines = [
        conference.submission_deadline
        for conference in paper.conferences
        if conference.submission_deadline
    ]

    if conference_deadlines:
        return min(conference_deadlines)

    return paper.deadline


# =========================================
# PAPER CONTEXT
# =========================================

def build_paper_context(paper):

    total_tasks = len(paper.tasks)

    completed_tasks = sum(
        1
        for task in paper.tasks
        if task.completed
    )

    incomplete_tasks = [
        {
            "title": task.title,
            "category": task.category,
        }
        for task in paper.tasks
        if not task.completed
    ]

    progress = (
        round(
            completed_tasks / total_tasks * 100
        )
        if total_tasks
        else 0
    )

    deadline = get_effective_deadline(paper)

    days_left = None

    if deadline:
        days_left = (
            deadline - date.today()
        ).days

    return {
        "title": paper.title,
        "progress": progress,
        "completed_tasks": completed_tasks,
        "total_tasks": total_tasks,
        "incomplete_tasks": incomplete_tasks,
        "days_left": days_left,
    }


# =========================================
# GROQ
# =========================================

def call_groq(context, mode):

    api_key = settings.groq_api_key

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Groq AI is not configured",
        )

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )

    # =====================================
    # INSIGHT
    # =====================================

    if mode == "insight":

        instructions = """
You are a simple research task assistant.

Your job is NOT to give research advice.
Your job is only to give the researcher a short human-like status update.

Use ONLY the supplied information.

Write like a helpful teammate, not an AI assistant.

STRICT RULES:

- Keep every field extremely short.
- No long explanations.
- No generic advice.
- No research methodology advice.
- No journal or paper recommendations.
- No collaborators or mentors.
- No time-block suggestions.
- No invented information.
- Do not repeat the same fact in multiple fields.
- Do not mention the conference name unless necessary.
- Do not mention the exact date unless necessary.
- Do not use words like "essential", "critical", "formulating", "ensuring", "expedite", or "comprehensive".
- Do not use markdown.
- Use simple everyday English.

headline:
2-6 words describing what needs attention.

summary:
One short sentence describing the current situation.

reason:
One short sentence explaining why the item needs attention.

suggestion:
One short sentence saying what to do next.

Priority:
High = very little time and meaningful work remains.
Medium = work remains but there is reasonable time.
Low = little work remains or there is plenty of time.

If only one incomplete task exists, focus on that task.

Return ONLY JSON.
"""

        schema = {
            "type": "json_schema",
            "json_schema": {
                "name": "research_progress_insight",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "headline": {
                            "type": "string"
                        },
                        "summary": {
                            "type": "string"
                        },
                        "priority": {
                            "type": "string",
                            "enum": [
                                "High",
                                "Medium",
                                "Low",
                            ],
                        },
                        "reason": {
                            "type": "string"
                        },
                        "suggestion": {
                            "type": "string"
                        },
                    },
                    "required": [
                        "headline",
                        "summary",
                        "priority",
                        "reason",
                        "suggestion",
                    ],
                    "additionalProperties": False,
                },
            },
        }

    # =====================================
    # NEXT TASK
    # =====================================

    else:

        instructions = """
You are a simple research task assistant.

Choose ONE task from the supplied incomplete task list.

Write like a helpful teammate.

STRICT RULES:

- The task MUST be one of the supplied incomplete tasks.
- Keep every field to ONE short sentence.
- No generic research advice.
- No invented tasks.
- No research methodology.
- No journal recommendations.
- No collaborators or mentors.
- No time-block suggestions.
- Do not repeat the deadline unnecessarily.
- Do not use words like "essential", "critical", "formulating", "ensuring", or "expedite".
- Do not use markdown.
- Use simple everyday English.

task:
The exact title of the selected incomplete task.

why:
One short natural sentence.

action:
One short sentence telling the researcher what to do with that task.

urgency:
High, Medium, or Low.

Return ONLY JSON.
"""

        schema = {
            "type": "json_schema",
            "json_schema": {
                "name": "research_next_step",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "task": {
                            "type": "string"
                        },
                        "why": {
                            "type": "string"
                        },
                        "urgency": {
                            "type": "string",
                            "enum": [
                                "High",
                                "Medium",
                                "Low",
                            ],
                        },
                        "action": {
                            "type": "string"
                        },
                    },
                    "required": [
                        "task",
                        "why",
                        "urgency",
                        "action",
                    ],
                    "additionalProperties": False,
                },
            },
        }

    # =====================================
    # REQUEST
    # =====================================

    user_input = (
        "Paper context:\n"
        + json.dumps(
            context,
            indent=2,
        )
    )

    try:

        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": instructions,
                },
                {
                    "role": "user",
                    "content": user_input,
                },
            ],
            response_format=schema,
        )

        content = (
            response
            .choices[0]
            .message
            .content
        )

        if not content:
            raise ValueError(
                "Groq returned an empty response"
            )

        return json.loads(content)

    except HTTPException:
        raise

    except Exception as error:

        print(
            "GROQ AI ERROR:",
            error,
        )

        raise HTTPException(
            status_code=502,
            detail="Could not generate AI response",
        )


# =========================================
# AI INSIGHT
# =========================================

@router.get(
    "/{paper_id}/ai/insight",
    response_model=dict,
)
def get_ai_insight(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    user_id = get_user_id(current_user)

    paper = get_owned_paper(
        paper_id,
        db,
        user_id,
    )

    context = build_paper_context(paper)

    result = call_groq(
        context,
        "insight",
    )

    return {
        "paper_id": paper.id,
        "type": "progress_insight",
        "data": result,
    }


# =========================================
# AI NEXT TASK
# =========================================

@router.get(
    "/{paper_id}/ai/next",
    response_model=dict,
)
def get_ai_next_step(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    user_id = get_user_id(current_user)

    paper = get_owned_paper(
        paper_id,
        db,
        user_id,
    )

    context = build_paper_context(paper)

    result = call_groq(
        context,
        "next",
    )

    return {
        "paper_id": paper.id,
        "type": "next_step",
        "data": result,
    }