import serial
import time
import string
import pynmea2
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from pubnub.exceptions import PubNubException

pnChannel = "real-time-pi-tracker"

pnconfig = PNConfiguration()
pnconfig.subscribe_key = "sub-c-4307464c-20d0-11ea-9a43-ea7c703d46e3"
pnconfig.publish_key = "pub-c-d2eb3e07-0d10-421a-9dae-4d6f0fbdf34f"
pnconfig.ssl = False
 
pubnub = PubNub(pnconfig)
pubnub.subscribe().channels(pnChannel).execute()

while True:
    port="/dev/ttyAMA0"
    ser=serial.Serial(port, baudrate=9600, timeout=0.5)
    dataout = pynmea2.NMEAStreamReader()
    newdata=ser.readline()

    if newdata[0:6] == "$GPRMC":
        newmsg=pynmea2.parse(newdata)
        lat=newmsg.latitude
        lng=newmsg.longitude
        try:
            envelope = pubnub.publish().channel(pnChannel).message({
            'lat':lat,
            'lng':lng
            }).sync()
            print("publish timetoken: %d" % envelope.result.timetoken)
        except PubNubException as e:
            handle_exception(e)