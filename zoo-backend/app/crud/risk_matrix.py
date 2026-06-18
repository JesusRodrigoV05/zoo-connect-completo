from typing import Iterable, List

from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.models.risk_control import RiskControl
from app.models.risk_matrix import RiskMatrixEntry
from app.schemas.risk_matrix import RiskMatrixEntryCreate, RiskMatrixEntryUpdate
from app.services.risk_validator import validate_risk_entry
from app.crud.information_asset import get_asset


def list_entries(db: Session) -> List[RiskMatrixEntry]:
    return (
        db.query(RiskMatrixEntry)
        .options(joinedload(RiskMatrixEntry.controls))
        .order_by(RiskMatrixEntry.id)
        .all()
    )


def _validate_asset(db: Session, asset_id: int | None):
    if asset_id is not None:
        asset = get_asset(db, asset_id)
        if not asset:
            raise ValueError(f"Information asset with ID {asset_id} not found.")


def create_entry(
    db: Session,
    entry_in: RiskMatrixEntryCreate,
    user_id: str | None = None,
) -> RiskMatrixEntry:
    validate_risk_entry(entry_in)
    _validate_asset(db, entry_in.information_asset_id)
    data = entry_in.model_dump(exclude={"controls"})
    entry = RiskMatrixEntry(
        **data,
        created_by_id=user_id,
        updated_by_id=user_id,
    )
    entry.controls = [RiskControl(**control.model_dump()) for control in entry_in.controls]
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def replace_entries(
    db: Session,
    entries_in: Iterable[RiskMatrixEntryCreate],
    user_id: str | None = None,
) -> List[RiskMatrixEntry]:
    entries_payload = list(entries_in)
    # Validate all entries before replacing
    for entry_in in entries_payload:
        validate_risk_entry(entry_in)
        _validate_asset(db, entry_in.information_asset_id)

    try:
        db.query(RiskControl).delete()
        db.query(RiskMatrixEntry).delete()
        entries = [
            RiskMatrixEntry(
                **entry_in.model_dump(exclude={"controls"}),
                created_by_id=user_id,
                updated_by_id=user_id,
                controls=[
                    RiskControl(**control.model_dump())
                    for control in entry_in.controls
                ],
            )
            for entry_in in entries_payload
        ]
        db.add_all(entries)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    return list_entries(db)


def update_entry(
    db: Session,
    entry_id: int,
    entry_in: RiskMatrixEntryUpdate,
    user_id: str | None = None,
) -> RiskMatrixEntry | None:
    validate_risk_entry(entry_in)
    _validate_asset(db, entry_in.information_asset_id)
    entry = db.query(RiskMatrixEntry).filter(RiskMatrixEntry.id == entry_id).first()
    if not entry:
        return None

    data = entry_in.model_dump(exclude={"controls"})
    for field, value in data.items():
        setattr(entry, field, value)
    entry.updated_by_id = user_id
    entry.controls = [RiskControl(**control.model_dump()) for control in entry_in.controls]

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
