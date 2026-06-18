import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.information_asset import InformationAsset
from app.models.risk_control import RiskControl
from app.models.risk_matrix import RiskMatrixEntry
from app.crud.risk_matrix import create_entry, replace_entries
from app.crud.information_asset import sync_assets_from_inventory_products
from app.models.inventario import Producto, TipoProducto, UnidadMedida
from app.schemas.risk_matrix import RiskMatrixEntryCreate

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_create_entry_fails_with_invalid_asset(db_session):
    entry_in = RiskMatrixEntryCreate(
        information_asset_id=999,
        asset="Test",
        threat="Threat",
        consequence="Cons",
        probability=1,
        impact=1,
        residual_probability=1,
        residual_impact=1,
    )
    with pytest.raises(ValueError, match="not found"):
        create_entry(db_session, entry_in)

def test_create_entry_with_multiple_controls(db_session):
    asset = InformationAsset(
        name="Test Asset",
        category="Software",
        confidentiality=1,
        integrity=1,
        availability=1,
    )
    db_session.add(asset)
    db_session.commit()
    db_session.refresh(asset)

    entry_in = RiskMatrixEntryCreate(
        information_asset_id=asset.id,
        asset="Test Asset",
        threat="Usurpacion de identidad",
        vulnerability="Credenciales debiles",
        risk_event="Acceso no autorizado a la base de datos",
        consequence="Eliminacion de registros y afectacion a clientes",
        probability=4,
        impact=4,
        residual_probability=2,
        residual_impact=3,
        controls=[
            {
                "description": "MFA para usuarios administrativos",
                "control_type": "P",
                "automation_level": "A",
                "frequency": "PT",
            },
            {
                "description": "Revision diaria de logs de acceso",
                "control_type": "D",
                "automation_level": "S",
                "frequency": "D",
            },
        ],
    )

    entry = create_entry(db_session, entry_in)

    assert entry.vulnerability == "Credenciales debiles"
    assert entry.risk_event == "Acceso no autorizado a la base de datos"
    assert len(entry.controls) == 2
    assert entry.controls[0].description == "MFA para usuarios administrativos"

def test_score_values_are_strict_integers_between_one_and_five():
    with pytest.raises(ValidationError):
        RiskMatrixEntryCreate(asset="A", threat="T", probability=0, impact=1)

    with pytest.raises(ValidationError):
        RiskMatrixEntryCreate(asset="A", threat="T", probability=6, impact=1)

    with pytest.raises(ValidationError):
        RiskMatrixEntryCreate(asset="A", threat="T", probability=1.5, impact=1)

    with pytest.raises(ValidationError):
        RiskMatrixEntryCreate(asset="A", threat="T", probability="4", impact=1)

def test_replace_entries_atomicity(db_session):
    # Setup: add an existing entry
    asset = InformationAsset(
        name="Test Asset",
        category="Software",
        confidentiality=1,
        integrity=1,
        availability=1,
    )
    db_session.add(asset)
    db_session.commit()
    db_session.refresh(asset)
    
    entry1 = RiskMatrixEntry(
        information_asset_id=asset.id,
        asset="E1",
        threat="T",
        consequence="C",
        probability=1,
        impact=1,
        residual_probability=1,
        residual_impact=1,
        controls=[
            RiskControl(
                description="Control existente",
                control_type="P",
                automation_level="A",
                frequency="PT",
            )
        ],
    )
    db_session.add(entry1)
    db_session.commit()

    # Attempt replacement with one valid and one invalid entry
    entries_in = [
        RiskMatrixEntryCreate(
            information_asset_id=asset.id,
            asset="E2",
            threat="T",
            consequence="C",
            probability=1,
            impact=1,
            residual_probability=1,
            residual_impact=1,
        ),
        RiskMatrixEntryCreate(
            information_asset_id=999,
            asset="E3",
            threat="T",
            consequence="C",
            probability=1,
            impact=1,
            residual_probability=1,
            residual_impact=1,
        ),
    ]
    
    with pytest.raises(ValueError, match="not found"):
        replace_entries(db_session, entries_in)
        
    # Verify atomicity: original entry should still exist
    entries = db_session.query(RiskMatrixEntry).all()
    assert len(entries) == 1
    assert entries[0].asset == "E1"
    assert len(entries[0].controls) == 1

def test_sync_assets_from_inventory_products_is_idempotent(db_session):
    tipo = TipoProducto(nombre_tipo_producto="Medicamentos")
    unidad = UnidadMedida(nombre_unidad="Unidad", abreviatura="u")
    db_session.add_all([tipo, unidad])
    db_session.commit()
    db_session.refresh(tipo)
    db_session.refresh(unidad)

    product = Producto(
        nombre_producto="Antibiotico",
        descripcion_producto="Producto critico",
        tipo_producto_id=tipo.id_tipo_producto,
        unidad_medida_id=unidad.id_unidad,
        is_active=True,
    )
    db_session.add(product)
    db_session.commit()

    sync_assets_from_inventory_products(db_session)
    sync_assets_from_inventory_products(db_session)

    assets = (
        db_session.query(InformationAsset)
        .filter(InformationAsset.name == "Inventario: Antibiotico")
        .all()
    )
    assert len(assets) == 1
    assert assets[0].category == "Inventario / Producto"
