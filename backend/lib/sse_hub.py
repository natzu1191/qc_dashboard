"""
In-process pub/sub for Server-Sent Events.

Assumes a single backend process (uvicorn without --workers > 1). For multi-
worker deployments, swap this for a Redis / Postgres LISTEN/NOTIFY bridge.
"""
import asyncio
import json
from typing import Any, AsyncIterator


class SSEHub:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[str]] = set()
        self._lock = asyncio.Lock()

    async def subscribe(self) -> asyncio.Queue[str]:
        q: asyncio.Queue[str] = asyncio.Queue(maxsize=64)
        async with self._lock:
            self._subscribers.add(q)
        return q

    async def unsubscribe(self, q: asyncio.Queue[str]) -> None:
        async with self._lock:
            self._subscribers.discard(q)

    async def publish(self, event: str, data: Any) -> None:
        payload = _format_sse(event, data)
        async with self._lock:
            stale: list[asyncio.Queue[str]] = []
            for q in self._subscribers:
                try:
                    q.put_nowait(payload)
                except asyncio.QueueFull:
                    stale.append(q)
            for q in stale:
                self._subscribers.discard(q)

    async def stream(self, q: asyncio.Queue[str]) -> AsyncIterator[str]:
        try:
            while True:
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield msg
                except asyncio.TimeoutError:
                    yield _format_sse("ping", {"t": "keepalive"})
        finally:
            await self.unsubscribe(q)


def _format_sse(event: str, data: Any) -> str:
    body = data if isinstance(data, str) else json.dumps(data, default=str)
    return f"event: {event}\ndata: {body}\n\n"


hub = SSEHub()
