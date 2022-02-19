import asyncio
import datetime
import logging

from helper import get_weekday

logger = logging.getLogger(__name__)


class Scheduler:
    def __init__(self, checks: list, scheduling_periods: dict, ex_pool):
        self.checks = checks
        self.scheduling_periods = scheduling_periods
        self.ex_pool = ex_pool

    async def schedule_interval(self, interval, checks):
        logger.debug(f"Scheduling with interval {interval} with {len(checks)} check(s)")
        while True:
            for x in checks:
                current_time = int(datetime.datetime.utcnow().strftime("%H%M"))
                time_period = self.scheduling_periods[str(x.scheduling_period)].time_periods.get(get_weekday())
                for period in time_period:
                    if int(period["start_time"]) <= current_time <= int(period["stop_time"]):
                        self.ex_pool.append_task(x)
                        break

            await asyncio.sleep(interval)

    async def run(self):
        intervals = list(set([x.scheduling_interval for x in self.checks]))
        logger.info(f"Creating event loops..")
        loops = [asyncio.create_task(self.schedule_interval(
            interval, [x for x in self.checks if x.scheduling_interval == interval],
        )) for interval in intervals]
        await asyncio.wait(loops)
