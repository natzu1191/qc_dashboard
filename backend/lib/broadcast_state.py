"""
In-memory broadcast state representing what the TV is currently displaying.

Single-TV assumption — a process-local dict is sufficient. Resets to defaults
on backend restart, which is acceptable (operator re-selects instantly).
"""
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field


VALID_VIEWS = {"dashboard", "cases", "complaints"}


class BroadcastState(BaseModel):
    active_view: str = "dashboard"
    filters: dict[str, Any] = Field(default_factory=dict)
    highlighted_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BroadcastUpdate(BaseModel):
    active_view: Optional[str] = None
    filters: Optional[dict[str, Any]] = None
    highlighted_id: Optional[str] = None
    clear_highlight: bool = False


_state = BroadcastState()


def get_state() -> BroadcastState:
    return _state


def apply_update(patch: BroadcastUpdate) -> BroadcastState:
    global _state
    next_view = _state.active_view
    next_filters = dict(_state.filters)
    next_highlight = _state.highlighted_id

    if patch.active_view is not None:
        if patch.active_view not in VALID_VIEWS:
            raise ValueError(f"Invalid view: {patch.active_view}")
        next_view = patch.active_view

    if patch.filters is not None:
        next_filters = patch.filters

    if patch.clear_highlight:
        next_highlight = None
    elif patch.highlighted_id is not None:
        next_highlight = patch.highlighted_id

    _state = BroadcastState(
        active_view=next_view,
        filters=next_filters,
        highlighted_id=next_highlight,
        updated_at=datetime.now(timezone.utc),
    )
    return _state
