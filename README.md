# What is lidar_wrtc ?  
**Warning:** I'm not a developer!  
A small Python proof of concept that reads binary data from at least one OKDO LDO6 LIDAR via the serial port(s).
The coordinates are extracted, decoded, converted to Cartesian coordinates and transmitted in batches of 360° measurements to a web page via a WebRTC Data Channel.
A polygonal filter and an offset position can be applied to each LIDAR.
The web page (an HTML file with embedded Javascript), is served by the same Python script in HTTP on port 8080. A graphical display shows the real-time measurements taken by the LIDAR(s).  
The "LIDAR" decoding is largely based on James Gibbard's (https://gibbard.me/lidar/).  
Many settings can be done using a .ini file

## Requirements :
- at least one OKDO LIDAR LD06 (small, inexpensive LIDAR)
- one USB / Serial dongle per LIDAR
- Python 3.12 (likely to run with earlier versions)

## To do :  
- fix html/js code to manage the right number of lidars more easily (jinja template?)  
  actually you need to edit client.js to set up "lidars" variable with the list of lidars names you declared in .ini file.

## Planned evolutions :
- sort python debug and change default name
- enable plotly graph setting
- color points according to lidars?
- allowing to choose an .ini parameter file
- Manage script termination
- Write Python/HTML/Javascript code cleanly (I need help)
- Optimize code

## Planned tests :
- tests on Windows and MacOS
- check lidar positioning and filters
- test with 3 lidars
- test with 1 lidar
- test with non-orthogonal shape filters

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
Before running server, you may edit lidar_wrtc.ini to adapt according to your needs.
  
```bash
python lidar_wrtc.py
```
Now point your browser to http://0.0.0.0:8080 
