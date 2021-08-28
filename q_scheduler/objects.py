class SchedulingPeriod:
    def __init__(self, id, name, comment, time_periods):
        self.id = id
        self.name = name
        self.time_periods = time_periods


class Check:
    def __init__(self, id, linked_check, scheduling_period, scheduling_interval, context):
        self.id = id
        self.linked_check = linked_check
        self.scheduling_period = scheduling_period
        self.scheduling_interval = scheduling_interval
        self.context = context
