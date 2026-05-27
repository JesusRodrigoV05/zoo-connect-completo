from typing import Iterable, List

from sqlalchemy.orm import Session

from app.models.risk_matrix import RiskMatrixEntry
from app.schemas.risk_matrix import RiskMatrixEntryCreate, RiskMatrixEntryUpdate


def list_entries(db: Session) -> List[RiskMatrixEntry]:
    return db.query(RiskMatrixEntry).order_by(RiskMatrixEntry.id).all()


def create_entry(
    db: Session,
    entry_in: RiskMatrixEntryCreate,
    user_id: int | None = None,
) -> RiskMatrixEntry:
    entry = RiskMatrixEntry(
        **entry_in.model_dump(),
        created_by_id=user_id,
        updated_by_id=user_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def replace_entries(
    db: Session,
    entries_in: Iterable[RiskMatrixEntryCreate],
    user_id: int | None = None,
) -> List[RiskMatrixEntry]:
    db.query(RiskMatrixEntry).delete()

    entries = [
        RiskMatrixEntry(
            **entry_in.model_dump(),
            created_by_id=user_id,
            updated_by_id=user_id,
        )
        for entry_in in entries_in
    ]
    db.add_all(entries)
    db.commit()

    return list_entries(db)


def update_entry(
    db: Session,
    entry_id: int,
    entry_in: RiskMatrixEntryUpdate,
    user_id: int | None = None,
) -> RiskMatrixEntry | None:
    entry = db.query(RiskMatrixEntry).filter(RiskMatrixEntry.id == entry_id).first()
    if not entry:
        return None

    for field, value in entry_in.model_dump().items():
        setattr(entry, field, value)
    entry.updated_by_id = user_id

    db.commit()
    db.refresh(entry)
    return entry


def delete_entry(db: Session, entry_id: int) -> bool:
    entry = db.query(RiskMatrixEntry).filter(RiskMatrixEntry.id == entry_id).first()
    if not entry:
        return False

    db.delete(entry)
    db.commit()
    return True
