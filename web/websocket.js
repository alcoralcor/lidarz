const buttonDebug = document.getElementById('dc_debug');
const outputDebug = document.getElementById('dc_debug_feedback');

const colors = ["red", "green", "dodgerblue", "orange", "saddlebrown"];
const debugColors = ["pink", "lightgreen", "lightblue", "peachpuff", "rosybrown"];

let debug;
let webConfig = {};
let lidars = [];
let allData = [];

let xValues = [];
let yValues = [];

const trace = {
    x: xValues,
    y: yValues,
    mode: 'markers+lines',
    type: 'scatter',
    marker: {color: 'black'}
};

let layout = {};

function updateGraph(newTraces) {
    Plotly.newPlot('graph', newTraces, layout, {staticPlot: true});
}

async function startConnection() {
    let socket = new WebSocket(`ws://${location.host}/ws`);

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data);

        const newData = JSON.parse(evt.data);
        lidarName = Object.keys(newData)[0];
        lidarData = Object.values(newData)[0];
        if (lidarRead.includes(lidarName)) {
            lidarRead = lidarRead.filter(item => item !== lidarName);

            if (debug) {
                const zone = [...webConfig[lidarName]];
                zone.push([...webConfig[lidarName][0]]);
                xValues = zone.map(point => point[0]);
                yValues = zone.map(point => point[1]);
                graphData = { x: xValues, y: yValues, mode: 'lines', type: 'scatter', line: {dash: 'dash', width: 2, color: debugColors[lidars.indexOf(lidarName)]}, name: "DEBUG " + lidarName};
                allData.push(graphData);
            }

            xValues = lidarData.map(point => point[0]);
            yValues = lidarData.map(point => point[1]);
            graphData = { x: xValues, y: yValues, mode: 'markers', type: 'scatter', marker: {size: 3, color: debug?colors[lidars.indexOf(lidarName)]:"blue"}, name: lidarName};
            allData.push(graphData);

            if(lidarRead.length === 0) {
                updateGraph(allData);
                allData = [];
                lidarRead = [...lidars];
            }
        } else {
            console.log(`${lidarName} message rejected`);
        }
    };

    socket.onopen = function() {
        console.log("WebSocket connecté");
    };

    socket.onclose = function() {
        console.log("WebSocket déconnecté");
    };
}

function initLidarz() {
    lidars = Object.keys(webConfig).filter(item => item !== "DEBUG");
    lidarRead = [...lidars];
    startConnection();
}

async function run() {
    try {
        const response = await fetch(`http://${location.host}/config`);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        webConfig = await response.json();

        const ranges = Object.keys(webConfig)
            .filter(key => key.startsWith("LIDAR"))
            .map(key => webConfig[key])
            .flat();
        const xs = ranges.map(p => p[0]);
        const ys = ranges.map(p => p[1]);

        let xmin = Math.min(...xs);
        let xmax = Math.max(...xs);
        let ymin = Math.min(...ys);
        let ymax = Math.max(...ys);

        const xMargin = (xmax - xmin) * 0.01;
        const yMargin = (ymax - ymin) * 0.01;

        xmin -= xMargin;
        xmax += xMargin;
        ymin -= yMargin;
        ymax += yMargin;

        const bboxWidth = xmax - xmin;
        const bboxHeight = ymax - ymin;

        const aspectRatio = bboxWidth / bboxHeight;

        const frameWidth = 1920;
        const frameHeight = 1200;

        let finalWidth, finalHeight;

        if (aspectRatio > frameWidth / frameHeight) {
            finalWidth = frameWidth;
            finalHeight = frameWidth / aspectRatio;
        } else {
            finalHeight = frameHeight;
            finalWidth = frameHeight * aspectRatio;
        }

        layout = {
            title: 'OKDO LD06 to WebSocket',
            xaxis: { title: 'X', fixedrange: true, range: [xmin, xmax], visible: false},
            yaxis: { title: 'Y', fixedrange: true, range: [ymin, ymax], visible: false},
            autosize: false,
            width: finalWidth,
            height: finalHeight,
            margin: {l: 0, r: 0, b: 0, t: 0, pad: 0}
        };

        initLidarz();
    } catch (error) {
        console.error(error.message);
    }
}

window.onload = () => {
    buttonDebug.addEventListener('click', () => {
        debug = !debug;
        outputDebug.textContent = debug ? "ON" : "OFF";
    });

    run();
};
