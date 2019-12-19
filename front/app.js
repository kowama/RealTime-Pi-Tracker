window.lat = 11.1649;
window.lng = -4.3052;

var map;
var mark;
var lineCoords = [];

var initialize = function () {
  map = new google.maps.Map(document.getElementById('map-canvas'), { center: { lat: lat, lng: lng }, zoom: 12 });
  mark = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: map });
};

window.initialize = initialize;

var redraw = function (payload) {
  if (payload.message.lat) {
    lat = payload.message.lat;
    lng = payload.message.lng;

    map.setCenter({ lat: lat, lng: lng, alt: 0 });
    mark.setPosition({ lat: lat, lng: lng, alt: 0 });

    lineCoords.push(new google.maps.LatLng(lat, lng));

    var lineCoordinatesPath = new google.maps.Polyline({
      path: lineCoords,
      geodesic: true,
      strokeColor: '#2E10FF'
    });

    lineCoordinatesPath.setMap(map);
  }
};

var pnChannel = "real-time-pi-tracker";

var pubnub = new PubNub({
  publishKey: 'pub-c-d2eb3e07-0d10-421a-9dae-4d6f0fbdf34f',
  subscribeKey: 'sub-c-4307464c-20d0-11ea-9a43-ea7c703d46e3'
});

document.querySelector('#start-btn').addEventListener('click', function () {
  var text = document.getElementById("start-btn").textContent;
  if (text == "Start Tracking") {
    pubnub.subscribe({ channels: [pnChannel] });
    pubnub.addListener({ message: redraw });
    document.getElementById("start-btn").classList.add('btn-danger');
    document.getElementById("start-btn").classList.remove('btn-success');
    document.getElementById("start-btn").textContent = 'Stop Tracking';
  }
  else {
    pubnub.unsubscribe({ channels: [pnChannel] });
    document.getElementById("start-btn").classList.remove('btn-danger');
    document.getElementById("start-btn").classList.add('btn-success');
    document.getElementById("start-btn").textContent = 'Start Tracking';
  }
});


function newPoint(time) {
  var radius = 0.01;
  var x = Math.random() * radius;
  var y = Math.random() * radius;
  return { lat: window.lat + y, lng: window.lng + x };
}
function debug(){
  pubnub.publish({ channel: pnChannel, message: newPoint() });
}