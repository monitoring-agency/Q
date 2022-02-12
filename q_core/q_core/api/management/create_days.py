from description.models import Day, Period, DayTimePeriod, TimePeriod

days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]


def create_time_related():
    for x in days:
        Day.objects.get_or_create(name=x)
    period, _ = Period.objects.get_or_create(start_time=0000, stop_time=2400)
    tp_24x7, _ = TimePeriod.objects.get_or_create(name="24x7")
    tp_24x7.time_periods.clear()
    for x in Day.objects.all():
        dtp, _ = DayTimePeriod.objects.get_or_create(day=x)
        dtp.periods.clear()
        dtp.periods.add(period)
        dtp.save()
        tp_24x7.time_periods.add(dtp)
    tp_24x7.save()
