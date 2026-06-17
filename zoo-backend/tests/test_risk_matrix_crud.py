import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.information_asset import InformationAsset
from app.models.risk_matrix import RiskMatrixEntry
from app.crud.risk_matrix import create_entry, replace_entries
from app.schemas.risk_matrix import RiskMatrixEntryCreate
from sqlalchemy.exc import SQLAlchemyError

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_create_entry_fails_with_invalid_asset(db_session):
    entry_in = RiskMatrixEntryCreate(information_asset_id=999, asset="Test", threat="Threat", consequence="Cons", probability=1, impact=1, residual_probability=1, residual_impact=1)
    with pytest.raises(ValueError, match="not found"):
        create_entry(db_session, entry_in)

def test_replace_entries_atomicity(db_session):
    # Setup: add an existing entry
    asset = InformationAsset(name="Test Asset", confidentiality=1, integrity=1, availability=1)
    db_session.add(asset)
    db_session.commit()
    db_session.refresh(asset)
    
    entry1 = RiskMatrixEntry(information_asset_id=asset.id, asset="E1", threat="T", consequence="C", probability=1, impact=1, residual_probability=1, residual_impact=1)
    db_session.add(entry1)
    db_session.commit()

    # Attempt replacement with one valid and one invalid entry
    entries_in = [
        RiskMatrixEntryCreate(information_asset_id=asset.id, asset="E2", threat="T", consequence="C", probability=1, impact=1, residual_probability=1, residual_impact=1),
        RiskMatrixEntryCreate(information_asset_id=999, asset="E3", threat="T", consequence="C", probability=1, impact=1, residual_probability=1, residual_impact=1)
    ]
    
    with pytest.raises(ValueError, match="not found"):
        replace_entries(db_session, entries_in)
        
    # Verify atomicity: original entry should still exist
    entries = db_session.query(RiskMatrixEntry).all()
    assert len(entries) == 1
    assert entries[0].asset == "E1"
