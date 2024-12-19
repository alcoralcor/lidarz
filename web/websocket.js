const button = document.getElementById('dc_close');
const outputDiv = document.getElementById('dc_close_feedback');

const lidars = ["LIDAR1", "LIDAR2"];
// const lidars = ["LIDAR1"];
lidarRead = [...lidars];
allData = [];

let xValues = [];
let yValues = [];

const trace = {
    x: xValues,
    y: yValues,
    mode: 'markers+lines',
    type: 'scatter'
};

const layout = {
    title: 'OKDO LD06 to WebSocket',
    xaxis: { title: 'X' },
    yaxis: { title: 'Y' }
};

Plotly.newPlot('graph', [trace], layout);

function updateGraph(newPoints) {
    xValues = newPoints.map(point => point[0]);
    yValues = newPoints.map(point => point[1]);

    Plotly.react('graph', [{ x: xValues, y: yValues, mode: 'markers+lines', type: 'scatter' }], layout);
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
            allData = [...allData, ...lidarData];
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

window.onload = () => {
    startConnection();
};
