from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.information_asset import InformationAsset
from app.schemas.information_asset import InformationAssetCreate, InformationAssetUpdate

def list_assets(db: Session) -> List[InformationAsset]:
    return db.query(InformationAsset).order_by(InformationAsset.name).all()

def get_asset(db: Session, asset_id: int) -> Optional[InformationAsset]:
    return db.query(InformationAsset).filter(InformationAsset.id == asset_id).first()

def create_asset(db: Session, asset_in: InformationAssetCreate, user_id: str) -> InformationAsset:
    asset = InformationAsset(
        **asset_in.model_dump(),
        created_by_id=user_id
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

def update_asset(db: Session, asset_id: int, asset_in: InformationAssetUpdate) -> Optional[InformationAsset]:
    asset = get_asset(db, asset_id)
    if not asset:
        return None
    
    update_data = asset_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset_id: int) -> bool:
    asset = get_asset(db, asset_id)
    if not asset:
        return False
    db.delete(asset)
    db.commit()
    return True

def sync_assets_from_permissions(db: Session) -> None:
    """Sincroniza los gestores/módulos de permisos como Activos de Información."""
    from app.crud.permission import DEFAULT_PERMISSIONS
    
    # Extraer gestores únicos (los que habilitan grupos en el menú)
    managers = [p for p in DEFAULT_PERMISSIONS if p["code"].startswith("access_") or p["code"] == "manage_veterinary_module"]
    
    for mgr in managers:
        # Evitar duplicados por nombre
        existing = db.query(InformationAsset).filter(InformationAsset.name == mgr["name"]).first()
        if existing:
            continue
            
        # Determinar criticidad CID basada en el módulo
        # 5: Crítico, 1: Bajo
        cid = {"c": 3, "i": 3, "d": 3} # Default medio
        
        module = mgr.get("module", "")
        if module == "admin":
            cid = {"c": 5, "i": 5, "d": 4} # Admin es crítico para integridad
        elif module == "veterinario":
            cid = {"c": 5, "i": 5, "d": 5} # Salud es crítico total
        elif module == "animales":
            cid = {"c": 2, "i": 4, "d": 4} # Integridad de datos de especies
        elif module == "inventario":
            cid = {"c": 2, "i": 4, "d": 3}
            
        new_asset = InformationAsset(
            name=mgr["name"],
            description=mgr["description"],
            category="Software / Gestor",
            confidentiality=cid["c"],
            integrity=cid["i"],
            availability=cid["d"],
        )
        db.add(new_asset)
    
    db.commit()
