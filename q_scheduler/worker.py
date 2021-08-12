import asyncio
import logging
import time

import httpx
from httpx import AsyncClient

from objects import CheckResult


logger = logging.getLogger(__name__)


class Worker:
    def __init__(self, check, client: AsyncClient):
        self.check = check
        self.client = client

    async def submit_result(self, cr):
        await self.client.post(f"https://127.0.0.1:8443/scheduler/api/v1/submit", json=cr.to_dict(), timeout=10)

    async def run(self):
        logger.debug(f"Starting worker on {self.check.id}:{self.check.context}")
        process_start = time.time()
        proc = await asyncio.create_subprocess_shell(self.check.linked_check, stdout=asyncio.subprocess.PIPE)
        stdout, _ = await proc.communicate()
        process_end = time.time()-process_start

        cr = CheckResult(
            self.check.id, self.check.context, process_stdout=stdout.decode("utf-8"),
            process_return_code=proc.returncode, process_execution_time=process_end
        )
        logger.debug(f"Got result from worker on {self.check.id}:{self.check.context}: {cr.to_json()}")


