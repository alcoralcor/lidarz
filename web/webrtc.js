const buttonClose = document.getElementById('dc_close');
const outputClose = document.getElementById('dc_close_feedback');

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
    title: 'OKDO LD06 to WebRTC Data Channel',
    xaxis: { title: 'X' },
    yaxis: { title: 'Y' }
};

Plotly.newPlot('graph', [trace], layout);

function updateGraph(newTraces) {
    Plotly.react('graph', newTraces, layout);
}

var pc = null;
var dc = null;

async function startConnection() {
    pc = new RTCPeerConnection();
    dc = pc.createDataChannel("lidar", { negotiated: true, ordered: true, id: 2 });

    dc.addEventListener('open', () => {
        console.log("Data channel opened");
    });
    dc.addEventListener('message', (evt) => {
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
            graphData = { x: xValues, y: yValues, mode: 'markers', type: 'scatter', marker: {size: 3, color: debug?colors[lidars.indexOf(lidarName)]:"blue"}, name: lidarName };
            allData.push(graphData);

            if(lidarRead.length === 0) {
                updateGraph(allData);
                allData = [];
                lidarRead = [...lidars];
            }
        } else {
            console.log(`${lidarName} message rejected`);
        }
    });
    dc.addEventListener('close', () => {
        console.log("Data channel closed");
        outputClose.textContent = "CLOSED";
    });
    
    negotiate();
}

function negotiate() {
    return pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
    }).then(() => {
        var offer = pc.localDescription;
        var codec;
    
        return fetch('/wrtc', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then((response) => {
        return response.json();
    }).then((answer) => {
        console.log(answer.sdp);
        return pc.setRemoteDescription(answer);
    }).catch((e) => {
        alert(e);
    });
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
        debug = webConfig["DEBUG"];
        outputDebug.textContent = debug ? "ON" : "OFF";
        initLidarz();
    } catch (error) {
        console.error(error.message);
    }
}

window.onload = () => {
    buttonClose.addEventListener('click', () => {
        dc.close();
    });
    buttonDebug.addEventListener('click', () => {
        debug = !debug;
        outputDebug.textContent = debug ? "ON" : "OFF";
    });
    run();
};
