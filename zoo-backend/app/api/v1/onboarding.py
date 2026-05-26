from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.onboarding_tour_progress import OnboardingTourProgress
from app.models.user import User
from app.schemas.onboarding import OnboardingTourStatusOut

router = APIRouter()


@router.get("/tours/{tour_key}", response_model=OnboardingTourStatusOut)
def get_tour_status(
    tour_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    progress = (
        db.query(OnboardingTourProgress)
        .filter(
            OnboardingTourProgress.user_id == current_user.id,
            OnboardingTourProgress.tour_key == tour_key,
        )
        .first()
    )

    if progress is None:
        return OnboardingTourStatusOut(tour_key=tour_key, completed=False, completed_at=None)

    return OnboardingTourStatusOut(
        tour_key=progress.tour_key,
        completed=progress.completed,
        completed_at=progress.completed_at,
    )


@router.post("/tours/{tour_key}/complete", response_model=OnboardingTourStatusOut)
def complete_tour(
    tour_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    progress = (
        db.query(OnboardingTourProgress)
        .filter(
            OnboardingTourProgress.user_id == current_user.id,
            OnboardingTourProgress.tour_key == tour_key,
        )
        .first()
    )

    if progress is None:
        progress = OnboardingTourProgress(
            user_id=current_user.id,
            tour_key=tour_key,
            completed=True,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(progress)
    else:
        progress.completed = True
        progress.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(progress)

    return OnboardingTourStatusOut(
        tour_key=progress.tour_key,
        completed=progress.completed,
        completed_at=progress.completed_at,
    )
