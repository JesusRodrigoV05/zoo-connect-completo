from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_permission
from app.core.enums import PermissionCode
from app.crud import risk_matrix as crud_risk_matrix
from app.db.session import get_db
from app.models.user import User
from app.schemas.risk_matrix import (
    RiskMatrixEntryCreate,
    RiskMatrixEntryOut,
    RiskMatrixEntryUpdate,
)

router = APIRouter(
    dependencies=[Depends(require_permission(PermissionCode.RISK_MATRIX_ACCESS))]
)


@router.get("", response_model=List[RiskMatrixEntryOut])
def list_risk_matrix_entries(db: Session = Depends(get_db)):
    return crud_risk_matrix.list_entries(db)


@router.post("", response_model=RiskMatrixEntryOut, status_code=status.HTTP_201_CREATED)
def create_risk_matrix_entry(
    entry_in: RiskMatrixEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return crud_risk_matrix.create_entry(db, entry_in, current_user.id)


@router.put("", response_model=List[RiskMatrixEntryOut])
def replace_risk_matrix_entries(
    entries_in: List[RiskMatrixEntryCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return crud_risk_matrix.replace_entries(db, entries_in, current_user.id)


@router.put("/{entry_id}", response_model=RiskMatrixEntryOut)
def update_risk_matrix_entry(
    entry_id: int,
    entry_in: RiskMatrixEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    entry = crud_risk_matrix.update_entry(db, entry_id, entry_in, current_user.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Fila de matriz no encontrada")
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_risk_matrix_entry(entry_id: int, db: Session = Depends(get_db)):
    deleted = crud_risk_matrix.delete_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Fila de matriz no encontrada")
