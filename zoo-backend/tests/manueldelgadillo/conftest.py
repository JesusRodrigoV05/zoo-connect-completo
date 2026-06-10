from unittest.mock import MagicMock


def query_first(db: MagicMock, mapping: dict) -> None:
    """Configura db.query(Model).filter(...).first() según el modelo consultado."""

    def query_side_effect(model):
        chain = MagicMock()
        chain.filter.return_value.first.return_value = mapping.get(model)
        return chain

    db.query.side_effect = query_side_effect
