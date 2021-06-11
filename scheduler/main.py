import asyncio

from scheduler.config import SchedulerConfig


async def main():
    config = SchedulerConfig()


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
