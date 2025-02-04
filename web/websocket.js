const buttonDebug = document.getElementById('dc_debug');
const outputDebug = document.getElementById('dc_debug_feedback');

const colors = ["red", "green", "dodgerblue", "orange", "saddlebrown"];
const debugColors = ["pink", "lightgreen", "lightblue", "peachpuff", "rosybrown"];

let debug;
let webConfig;
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

const layout = {
    title: 'OKDO LD06 to WebSocket',
    xaxis: { title: 'X', fixedrange: true, range: [-3.05, 3.05], visible: false},
    yaxis: { title: 'Y', fixedrange: true, range: [-0.1, 3.05], visible: false}, autosize: false, width: '1920', height: '1200', margin: {l: 0, r: 0, b: 0, t: 0, pad: 0}
};

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
                xValues = webConfig[lidarName].map(point => point[0]);
                yValues = webConfig[lidarName].map(point => point[1]);
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
