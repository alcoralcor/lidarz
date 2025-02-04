# What is lidarz ?  
**Disclaimer:** I'm not a developer!  

A small Python proof of concept that reads binary data from at least one OKDO LDO6 LIDAR via the serial port(s).  
The coordinates are extracted, decoded, converted to Cartesian coordinates and transmitted in batches of 360° measurements to a web page via a WebRTC Data Channel and/or a Websocket.  
A polygonal filter and an offset position can be applied to each LIDAR.  
The web page (an HTML file with embedded Javascript), is served by the same Python script in HTTP on port 8080. A graphical display shows the real-time measurements taken by the LIDAR(s).   
The configuration required by the client is accessible in json via the “/config” route.  
The "LIDAR" binary decoding is largely based on James Gibbard's (https://gibbard.me/lidar/).  
Many settings can be done using a .ini file. The configuration file name can be passed as an argument with the -c/--config option.  
A debug button/view is available in html example web pages. This is more helpful for zones calibration.  

This project is designed very basically to meet execution needs in a local installation. Websocket connection has been tested with Touchdesigner.

## Known issues :
- Sometimes on Mac OS X : ValueError when adding offset to lidar coordinates.

## Requirements :
- Hardware with USB > 2.0 and Linux, Windows or Mac OS X (Tested on Ubuntu 24.04, 22.04, Windows 11 and Mac OS X Sequoia),
- at least one OKDO LIDAR LD06 (small, inexpensive LIDAR),
- as many USB / Serial dongle per LIDAR,
- Python 3.12 (likely to run with earlier versions).

## To do :  
- It is not guaranteed that serial ports always have the same name, or that they always correspond to the same physical port; inversions may occur. document procedures for configuring “serial-ports” according to the computer's physical ports.

## Planned evolutions :
- sort python logging and change default name
- enable plotly graph setting
- color points according to lidars?
- allowing to choose an .ini parameter file
- Manage script termination
- Write Python/HTML/Javascript code cleanly (I need help)
- Optimize code

## Planned tests :
- tests on Windows and MacOS X (quickly but successfully tested)
- check lidar positioning and filters
- test with more than 2 lidars (quickly but successfully tested with 3 lidars)
- test with non-orthogonal shape filters

## Possible evolutions :
- Object tracking
- Multi-zone triggering

## Notes  
This project does not currently control LIDAR rotation speed. It defaults to 10Hz.

## Install procedure  
```bash
git clone https://github.com/alcoralcor/lidarz.git
cd lidarz
python -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```
Note : you may only have python3/pip3 already installed with no default so replace as needed.


## Running (until Ctrl+C)
Before running server, you may edit lidarz1.ini to adapt according to your needs.
  
```bash
python lidarz.py
```
Now point your browser to http://127.0.0.1:8080 (or any IP:port your have configured)
