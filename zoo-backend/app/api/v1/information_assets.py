from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_permission
from app.core.enums import PermissionCode
from app.crud import information_asset as crud_assets
from app.db.session import get_db
from app.models.user import User
from app.schemas.information_asset import (
    InformationAssetCreate,
    InformationAssetOut,
    InformationAssetUpdate,
)

router = APIRouter()

@router.get(
    "/",
    response_model=List[InformationAssetOut],
    dependencies=[Depends(require_permission(PermissionCode.RISK_MATRIX_ACCESS))],
)
def list_information_assets(db: Session = Depends(get_db)):
    """Lista todos los activos de información registrados."""
    crud_assets.sync_assets_from_sources(db)
    return crud_assets.list_assets(db)

@router.post(
    "/",
    response_model=InformationAssetOut,
    dependencies=[Depends(require_permission(PermissionCode.RISK_MATRIX_ACCESS))],
)
def create_information_asset(
    asset_in: InformationAssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Registra un nuevo activo de información."""
    return crud_assets.create_asset(db, asset_in, current_user.id)

@router.put(
    "/{asset_id}",
    response_model=InformationAssetOut,
    dependencies=[Depends(require_permission(PermissionCode.RISK_MATRIX_ACCESS))],
)
def update_information_asset(
    asset_id: int,
    asset_in: InformationAssetUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza los datos de un activo de información."""
    asset = crud_assets.update_asset(db, asset_id, asset_in)
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return asset

@router.delete(
    "/{asset_id}",
    dependencies=[Depends(require_permission(PermissionCode.RISK_MATRIX_ACCESS))],
)
def delete_information_asset(asset_id: int, db: Session = Depends(get_db)):
    """Elimina un activo de información."""
    if not crud_assets.delete_asset(db, asset_id):
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return {"ok": True}
