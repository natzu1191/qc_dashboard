from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from lib.broadcast_state import (
    BroadcastState,
    BroadcastUpdate,
    apply_update,
    get_state,
)
from lib.sse_hub import hub, _format_sse


router = APIRouter(prefix="/broadcast", tags=["Broadcast"])


@router.get("/state", response_model=BroadcastState)
async def read_state() -> BroadcastState:
    return get_state()


@router.post("/update", response_model=BroadcastState)
async def update_state(patch: BroadcastUpdate) -> BroadcastState:
    new_state = apply_update(patch)
    await hub.publish("state", new_state.model_dump(mode="json"))
    return new_state


@router.get("/stream")
async def stream(request: Request) -> StreamingResponse:
    queue = await hub.subscribe()
    initial = _format_sse("state", get_state().model_dump(mode="json"))

    async def event_generator():
        yield initial
        async for msg in hub.stream(queue):
            if await request.is_disconnected():
                break
            yield msg

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
