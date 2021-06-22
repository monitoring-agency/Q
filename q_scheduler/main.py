import json
import logging
import os

from q_scheduler.config import SchedulerConfig


logger = logging.getLogger("scheduler")


def main():
    config = SchedulerConfig.from_json("")
    if os.path.exists(config.description_path) and os.path.isfile(config.description_path):
        try:
            with open(config.description_path) as fh:
                description = json.load(fh)
        except json.JSONDecodeError:
            logging.info("Could not decode json")


if __name__ == '__main__':
    logging.basicConfig()
    main()
