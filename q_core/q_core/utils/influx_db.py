from influxdb_client import Point, InfluxDBClient, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

from q_core import settings


def insert_point(measurement, tags, fields, timestamp):
    client = InfluxDBClient(
        url=settings.DATABASES["influxdb"]["URI"],
        token=settings.DATABASES["influxdb"]["TOKEN"],
        org=settings.DATABASES["influxdb"]["ORG"]
    )
    write_api = client.write_api(write_options=SYNCHRONOUS)
    point = Point(measurement)
    [point.tag(x[0], x[1]) for x in tags]
    [point.field(x[0], x[1]) for x in fields]
    point.time(timestamp, write_precision=WritePrecision.S)
    write_api.write(bucket=settings.DATABASES["influxdb"]["BUCKET"], record=point)
    client.close()
