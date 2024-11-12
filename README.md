# What is lidar_wrtc ?  
**Warning:** I'm not a developer!  
A small Python proof of concept that reads binary data from an OKDO LDO6 LIDAR via the serial port.
The coordinates are extracted, decoded, converted to Cartesian coordinates and transmitted in batches of 360° measurements to a web page via a WebRTC Data Channel.
The web page (an HTML file with embedded Javascript), is served by the same Python script in HTTP on port 8080. A graphical display shows the real-time measurements taken by the LIDAR.  
The "LIDAR" code is largely based on James Gibbard's (https://gibbard.me/lidar/).  

## Requirements :
- OKDO LIDAR LD06 (small, inexpensive LIDAR)
- USB / Serial dongle
- Python 3.12 (likely to run with earlier versions)
  
## Planned evolutions :
- Filter the area to be monitored
- Write Python/HTML/Javascript code cleanly (I need help)
- Optimize code
  
## Possible evolutions :
- Object tracking
- Multi-zone triggering

## Notes  
This project does not currently control LIDAR rotation speed. It defaults to 10Hz.

## Install procedure  
```bash
git clone https://github.com/alcoralcor/lidar_wrtc.git
cd lidar_wrtc
python -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

## Running (until Ctrl+C)
Before running server, you may edit lidar_wrtc.py to change some values :
- SERVER_IP = "0.0.0.0"
- SERVER_PORT = 8080
- SERIAL_PORT = "/dev/ttyUSB0"
  
```bash
python lidar_wrtc.py
```
Now point your browser to http://0.0.0.0:8080 
