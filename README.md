# What is lidarz ?  
**Disclaimer:** I'm not a developer!  

A small Python proof of concept that reads binary data from at least one OKDO LDO6 LIDAR via the serial port(s).
The coordinates are extracted, decoded, converted to Cartesian coordinates and transmitted in batches of 360° measurements to a web page via a WebRTC Data Channel and/or a Websocket.
A polygonal filter and an offset position can be applied to each LIDAR.
The web page (an HTML file with embedded Javascript), is served by the same Python script in HTTP on port 8080. A graphical display shows the real-time measurements taken by the LIDAR(s).  
The "LIDAR" decoding is largely based on James Gibbard's (https://gibbard.me/lidar/).  
Many settings can be done using a .ini file

This project is designed very basically to meet execution needs in a local installation.

## Requirements :
- at least one OKDO LIDAR LD06 (small, inexpensive LIDAR)  
- as many USB / Serial dongle per LIDAR  
- Python 3.12 (likely to run with earlier versions)  

## To do :  
- fix html/js code to manage the right number of lidars more easily (jinja template?)  
  actually you need to edit .js files to set up "lidars" variable with the list of lidars names you declared in .ini file.

## Planned evolutions :
- sort python logging and change default name
- enable plotly graph setting
- color points according to lidars?
- allowing to choose an .ini parameter file
- Manage script termination
- Write Python/HTML/Javascript code cleanly (I need help)
- Optimize code

## Planned tests :
- tests on Windows and MacOS
- check lidar positioning and filters
- test with more than 2 lidars
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

## Running (until Ctrl+C)
Before running server, you may edit lidarz.ini to adapt according to your needs.
  
```bash
python lidarz.py
```
Now point your browser to http://0.0.0.0:8080 
