class SchedulingPeriod:
    def __init__(self, id, name, comment, time_periods):
        self.id = id
        self.name = name
        self.time_periods = time_periods


class Check:
    def __init__(self, id, linked_check, scheduling_period, scheduling_interval, context):
        self.id = id,
        self.linked_check = linked_check
        self.scheduling_period = scheduling_period
        self.scheduling_interval = scheduling_interval
        self.context = context


class CheckResult:
    def __init__(self, id, context, *, process_stdout, process_return_code, process_execution_time, process_time, data):
        self.id = id
        self.context = context
        self.process_stdout = process_stdout
        self.process_return_code = process_return_code
        self.data = data
        self.process_execution_time = process_execution_time
        self.process_time = process_time

    def to_dict(self):
        return {
            "id": self.id,
            "context": self.context,
            "stdout": self.process_stdout,
            "return_code": self.process_return_code,
            "data": self.data,
            "meta": {
                "process_time": self.process_time,
                "process_execution_time": self.process_execution_time
            },
        }
