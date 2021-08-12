import asyncio
import json
import logging
import os
import time

import certifi

from config import SchedulerConfig
from objects import SchedulingPeriod, Check
from executor import ExecutorPool
from scheduler import Scheduler

logger = logging.getLogger("scheduler")


def append_ca_bundle():
    ca_bundle = certifi.where()
    with open("/var/lib/q/certs/q-ca.pem", "rb") as fh:
        q_ca = fh.read()
    with open(ca_bundle, "rb") as fh:
        if fh.read().endswith(q_ca):
            return
    with open(ca_bundle, "ab") as fh:
        fh.write(q_ca)


async def start_scheduler(declaration, config):
    scheduling_periods = {}
    checks = []
    for x in declaration["scheduling_periods"]:
        scheduling_periods[x] = SchedulingPeriod(**declaration["scheduling_periods"][x])
    for x in declaration["hosts"]:
        checks.append(Check(**x, context="host"))
    for x in declaration["metrics"]:
        checks.append(Check(**x, context="metric"))

    ex_pool = ExecutorPool(config.workers)
    s = Scheduler(checks, scheduling_periods, ex_pool)
    asyncio.create_task(ex_pool.run())
    await asyncio.create_task(s.run())


def main():
    append_ca_bundle()
    config = SchedulerConfig.from_json("/etc/q-scheduler/q-scheduler.json")
    if os.path.exists(config["declaration_path"]) and os.path.isfile(config["declaration_path"]):
        try:
            with open(config.declaration_path) as fh:
                declaration = json.load(fh)
                asyncio.get_event_loop().run_until_complete(start_scheduler(declaration, config))
        except json.JSONDecodeError:
            logging.info("Could not decode json")
    else:
        logging.error(f"Description was not found at {config.declaration_path}")


if __name__ == '__main__':
    logging.basicConfig(
        filename="/var/log/q/q-scheduler.log",
        format='%(asctime)s :: %(levelname)s: %(message)s',
        datefmt='%d-%m-%Y %H:%M:%S',
        level=logging.DEBUG
    )
    logging.Formatter.converter = time.gmtime
    main()
