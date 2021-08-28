import asyncio
import json
import logging
import time
from datetime import datetime

from httpx import AsyncClient


logger = logging.getLogger(__name__)


class Worker:
    def __init__(self, check, client: AsyncClient):
        self.check = check
        self.client = client

    async def submit_result(self, check_result):
        await self.client.post(f"https://127.0.0.1:8443/scheduler/api/v1/submit", json=check_result, timeout=10)

    async def run(self):
        logger.debug(f"Starting worker on {self.check.id}:{self.check.context}")
        linked_check = self.check.linked_check.replace("\r\n", " ")
        process_start = time.time()
        proc = await asyncio.create_subprocess_shell(linked_check, stdout=asyncio.subprocess.PIPE)
        stdout, _ = await proc.communicate()
        process_end = time.time()
        utc_now = datetime.utcnow().timestamp()

        try:
            decoded = json.loads(stdout)
            decoded = {
                **decoded,
                "object_id": self.check.id,
                "context": self.check.context,
                "meta": {
                    "process_end_time": round(utc_now, 0),
                    "process_execution_time": round(process_end - process_start, 4)
                }
            }
        except json.JSONDecodeError:
            await self.submit_result({
                "object_id": self.check.id,
                "context": self.check.context,
                "state": "unknown",
                "output": "stdout could not be decoded as json",
                "datasets": [],
                "meta": {
                    "process_end_time": round(utc_now, 0),
                    "process_execution_time": round(process_end - process_start, 4)
                }
            })
            return

        logger.debug(f"Got result from worker on {self.check.id}:{self.check.context}: {decoded}")
        await self.submit_result(decoded)
