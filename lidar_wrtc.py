import asyncio
import json
import serial_asyncio_fast
import numpy as np
import struct
from enum import Enum
from json import JSONEncoder
import os
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription

PRINT_DEBUG = False

SERVER_IP = "0.0.0.0"
SERVER_PORT = 8080

SERIAL_PORT = "/dev/ttyUSB0"
SERIAL_BAUDRATE=230400
MEASUREMENTS_PER_PLOT = 480

MESSAGE_LENGTH = 47
MEASUREMENT_LENGTH = 12 
MESSAGE_FORMAT = "<xBHH" + "HB" * MEASUREMENT_LENGTH + "HHB"

State = Enum("State", ["SYNC0", "SYNC1", "SYNC2", "LOCKED", "UPDATE_PLOT", "WS_SEND"])
state = State.SYNC0 # looking for message header
message = b''       # message reconstruction
message_pos = 0     # position in message

measurements = []

ROOT = os.path.dirname(__file__)

pc = None
dc = None

# Serial read

class SerialProtocol(asyncio.Protocol):

    def connection_made(self, transport):
        self.transport = transport
        if PRINT_DEBUG: print('port opened', transport)

    def connection_lost(self, exc):
        if PRINT_DEBUG: print('port closed')
        self.transport.loop.stop()

    def data_received(self, data):
        global state, message, message_pos, measurements, dc, pc
        data_pos = 0
        data_len = len(data)
        if PRINT_DEBUG: print('data received', repr(data), data_len, data_pos, len(message), message_pos)
        while data_pos < data_len:
            if state == State.SYNC0:
                message = b''
                message_pos = 0
                if data[data_pos:data_pos+1] == b'\x54':
                    message = b'\x54'
                    message_pos += 1
                    if PRINT_DEBUG: print(state, message, data_len, data_pos, len(message), message_pos)
                    state = State.SYNC1
                else:
                    if PRINT_DEBUG: print(state, '\033[93m\033[1m' + "WARNING: Syncing" + '\033[0m', message, data_len, data_pos, len(message), message_pos)
                data_pos += 1

            elif state == State.SYNC1:
                if data[data_pos:data_pos+1] == b'\x2C':
                    message += b'\x2C'
                    message_pos += 1
                    if PRINT_DEBUG: print(state, message, data_len, data_pos, len(message), message_pos)
                    state = State.SYNC2
                else:
                    if PRINT_DEBUG: print(state, '\033[93m\033[1m' + "WARNING: Second byte not expected" + '\033[0m', message, data_len, data_pos, len(message), message_pos)
                    state = State.SYNC0
                data_pos += 1

            elif state == State.SYNC2:
                if (data_len - data_pos) < (MESSAGE_LENGTH - message_pos):
                    message += data[data_pos:]
                    message_pos += (data_len - data_pos)
                    data_pos = data_len
                    if PRINT_DEBUG: print(state, "Message à completer", message, data_len, data_pos, len(message), message_pos)
                else:
                    message += data[data_pos:(data_pos + MESSAGE_LENGTH - message_pos)]
                    data_pos += (MESSAGE_LENGTH - message_pos)
                    measurements += parse_lidar_data(message)
                    if PRINT_DEBUG: print(state, "Message complet", message, data_len, data_pos, len(message), message_pos)
                    if len(measurements) > MEASUREMENTS_PER_PLOT:
                        state = State.WS_SEND
                    else:
                        state = State.SYNC0
            elif state == State.WS_SEND:
                full_xy = get_xy_data(measurements)
                numpyData = {"array": full_xy}
                encodedNumpyData = json.dumps(numpyData, cls=NumpyArrayEncoder)
                if dc != None:
                    if dc.readyState == "open":
                        dc.send(encodedNumpyData)
                else:
                    if PRINT_DEBUG: print("NO DATA CHANNEL")
                measurements = []
                state = State.SYNC0


def parse_lidar_data(data):
    # Extract data
    length, speed, start_angle, *pos_data, stop_angle, timestamp, crc = \
        struct.unpack(MESSAGE_FORMAT, data)
    # Scale values
    start_angle = float(start_angle) / 100.0
    stop_angle = float(stop_angle) / 100.0
    # Unwrap angle if needed and calculate angle step size
    if stop_angle < start_angle:
        stop_angle += 360.0
    step_size = (stop_angle - start_angle) / (MEASUREMENT_LENGTH - 1)
    # Get the angle for each measurement in packet
    angle = [start_angle + step_size * i for i in range(0,MEASUREMENT_LENGTH)]
    distance = pos_data[0::2] # in millimeters
    if PRINT_DEBUG:
        print("PARSING", length, speed, start_angle, *pos_data, stop_angle, timestamp, crc)
    return list(zip(angle, distance))


def get_xy_data(measurements):
    # Unpack the tuples
    angle = np.array([measurement[0] for measurement in measurements])
    distance = np.array([measurement[1] for measurement in measurements])
    # Convert to cartesian coordinates in meters
    x = np.sin(np.radians(angle)) * (distance / 1000.0)
    y = np.cos(np.radians(angle)) * (distance / 1000.0)
    if PRINT_DEBUG:
        print(x, y)
        print(np.dstack((x, y)))
    return np.dstack((x, y))


class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)

# WebRTC send

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    if PRINT_DEBUG: print("Created for", request.remote)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if PRINT_DEBUG: print("Connection state is", pc.connectionState)
        if pc.connectionState == "failed":
            await pc.close()
            pc.discard(pc)

    await pc.setRemoteDescription(offer)

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type="application/json",
        text=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
    )


async def index(request):
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)


async def javascript(request):
    content = open(os.path.join(ROOT, "client.js"), "r").read()
    return web.Response(content_type="application/javascript", text=content)


async def main():
    global pc, dc

    loop = asyncio.get_event_loop()

    transport, protocol = await serial_asyncio_fast.create_serial_connection(loop, SerialProtocol, SERIAL_PORT, baudrate=SERIAL_BAUDRATE)

    pc = RTCPeerConnection()

    dc = pc.createDataChannel("lidar", negotiated=True, ordered=True, id=2) #

    @dc.on("open")
    def on_open():
        print("Data channel opened")

    app = web.Application()
    # app.on_shutdown.append(on_shutdown)
    app.router.add_get("/", index)
    app.router.add_get("/client.js", javascript)
    app.router.add_post("/offer", offer)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host=SERVER_IP, port=SERVER_PORT)
    await site.start()

    print("Server started. Point browser to", site.name)
    await asyncio.Event().wait()
    loop.close()


if __name__ == "__main__":
    asyncio.run(main())
