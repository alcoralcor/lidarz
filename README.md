# What is lidarz ?

> **Disclaimer**  
> I'm not a developer!  
> The "LIDAR" binary decoding is largely based on James Gibbard's (https://gibbard.me/lidar/).  

A Python tool that reads binary data from at least one OKDO LDO6 LIDAR via the serial port(s).  
The coordinates are extracted, decoded, converted to Cartesian coordinates and transmitted in batches of 360° measurements to a web page via a WebRTC Data Channel and/or a Websocket.  
A confidence threshold is applied, below which the measurements are rejected. This is mainly used when the LIDAR is placed in a large space to avoid unwanted noise.
A polygonal filter and an offset position can be applied to each LIDAR.  
The web page (an HTML file with embedded Javascript), is served by the same Python script in HTTP on port 8080. A graphical display shows the real-time measurements taken by the LIDAR(s). A debug button/view is available in html example web pages. This is more helpful for zones calibration.
The configuration required by the client is accessible in json via the “/config” route.  
Many settings can be done using a .ini file. The configuration file name can be passed as an argument with the -c/--config option.  
This project is designed very basically to meet execution needs in a local installation. Websocket connection has been tested with Touchdesigner.

## Known issues :

- Error when quitting
- WebRTC not stable (may be removed because I finally don't use it)

## Requirements :

- Hardware with USB > 2.0 and Linux, Windows or Mac OS X (Tested on Ubuntu 24.04, 22.04, Windows 11 and Mac OS X Sequoia),
- at least one OKDO LIDAR LD06 (small, inexpensive LIDAR),
- as many USB / Serial dongle per LIDAR,
- Python 3.12 (likely to run with earlier versions).

## To do :

- It is not guaranteed that serial ports always have the same name, or that they always correspond to the same physical port; inversions may occur. document procedures for configuring “serial-ports” according to the computer's physical ports.

## Planned evolutions :

All help is welcome :

- Manage script termination (Ctrl+C)
- Write Python/HTML/Javascript code cleanly
- Optimize code

## Planned tests :

- tests on Windows and MacOS X (quickly but successfully tested)
- test with non-orthogonal shape filters

## Notes

This project does not currently control LIDAR rotation speed, and probably never will. It defaults to 10Hz.

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
