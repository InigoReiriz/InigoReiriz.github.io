"use strict";

/*
* initial source: https://bost.ocks.org/mike/leaflet/
* this map uses d3 for geoJSON and some overlays
*/

// leaflet map tiles
var mbAttr = '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
L.mapbox.accessToken = 'pk.eyJ1IjoibXJrYWlrZXYiLCJhIjoiY2luZGF4NzA2MDA1Z3d6bHlwbWZ4YWI4YiJ9.5tLR_2fjmu95FYEaEAljYw';
var street = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	attribution: mbAttr
});

var grayscale = L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	attribution: mbAttr
});

var terrain = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var googlesat = L.tileLayer('https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
	attribution: "Map data &copy;2016 Google"
});

var positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

var map1 = L.map('map1', {
	center: [55.676098, 12.568337],
	zoom: 13,
	layers: [grayscale]
});

// control map layers
var baseLayers = {
	"Streets (Mapbox)": street,
	"Grayscale (Mapbox)": grayscale,
	"Grayscale (CartoDB)": positron,
	"Terrain (OSM)": terrain,
	"Satellite (Google)": googlesat
};

var d3Layer = L.Class.extend({
	initialize: function() {
		return;
	},
	onAdd: function() {
		d3.select("div#map1 .legend").style("display", "block");
		d3.select("div#map1 .regions").style("display", "block");
	},
	onRemove: function() {
		d3.select("div#map1 .regions").style("display", "none");
		d3.select("div#map1 .legend").style("display", "none");
	},
});

var svgLayer = new d3Layer();

var overlays = {
	"GeoJSON Regions": svgLayer
};
L.control.layers(baseLayers, overlays).addTo(map1);

// d3 map data
var svgMap = d3.select(map1.getPanes().overlayPane).append("svg"),
	g = svgMap.append("g").attr("class", "leaflet-zoom-hide regions"),
	g_circles = svgMap.append("g").attr("class", "leaflet-zoom-hide");

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

 // Setting color domains(intervals of values) for our map

d3.json("data/routelinks-4A.geojson", function(error, collection) {

	if (error) throw error;

	var transform = d3.geo.transform({
			point: projectPoint
	}),
	path = d3.geo.path().projection(transform);

	var LinkRefs = ['200:2673->200:2675', '200:1183->200:2673', '200:1188->200:1190',
	'200:1190->200:1192', '200:2675->200:1188', '200:1192->200:1193', '200:10427->200:1183']

	var array = []
	for (var i = 0; i < collection.features.length; i++) {
		if (LinkRefs.includes(collection.features[i].properties.LinkRef) == true){
			array.push(collection.features[i])
		}
	}

	var feature = g.selectAll("path")
		.data(array)
		.enter().append("path");

	feature.attr("d", path)
		.style("stroke", 'blue')
      	.style("fill", "none")
      	.style("stroke-width", 2)

	// Handle zoom of the map and repositioning of d3 overlay
	map1.on("viewreset", reset);
	reset();

	function reset(){

		var bounds =
				path.bounds(collection),
					topLeft = bounds[0],
					bottomRight = bounds[1];
				svgMap.attr("width", bottomRight[0] - topLeft[0])
					.attr("height", bottomRight[1] - topLeft[1])
					.style("left", topLeft[0] + "px")
					.style("top", topLeft[1] + "px");
				g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
				g_circles.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


		feature.attr("d", path)
			.style("stroke", 'red')
       		.style("fill", "none")
       		.style("stroke-width", 2)

    }
		// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map1.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}


	d3.json("data/stop_points.geojson", function(error, data) {

		if (error) throw error;

		var transform = d3.geo.transform({
				point: projectPoint
		}),
		path = d3.geo.path().projection(transform);

		var feature = g.selectAll("path")
			.data(data.features)
			.enter().append("path");

		feature.attr("d", path)
			.style("stroke", 'black')
	      	.style("fill", "none")
	      	.style("stroke-width", 2)


		// Handle zoom of the map and repositioning of d3 overlay
		map1.on("viewreset", reset);
		reset();

		function reset(){

			var bounds =
					path.bounds(data),
						topLeft = bounds[0],
						bottomRight = bounds[1];
					svgMap.attr("width", bottomRight[0] - topLeft[0])
						.attr("height", bottomRight[1] - topLeft[1])
						.style("left", topLeft[0] + "px")
						.style("top", topLeft[1] + "px");
					g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
					g_circles.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


			feature.attr("d", path)
				.style("stroke", 'blue')
	       		.style("fill", "none")
	       		.style("stroke-width", 2)

	    }
			// Use Leaflet to implement a D3 geometric transformation.
		function projectPoint(x, y) {
			var point = map1.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		}

	});

});
