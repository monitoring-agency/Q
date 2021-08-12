import asyncio

import httpx

from worker import Worker


class ExecutorPool:
    def __init__(self, workers):
        self.queue = []
        self.workers = workers
        self.client = httpx.AsyncClient()

    def append_task(self, task):
        self.queue.append(task)

    async def worker(self):
        while True:
            if self.queue:
                task = self.queue.pop()
                await Worker(task, self.client).run()
            else:
                await asyncio.sleep(0.1)

    async def run(self):
        worker_list = [asyncio.create_task(self.worker()) for _ in range(self.workers)]
        await asyncio.wait(worker_list)



