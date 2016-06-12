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
	center: [40, -3.07],
	zoom: 6,
	layers: [street]
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

// Popup with latlong where you clicked
var popup = L.popup();

function onMapClick(e) {
	popup
		.setLatLng(e.latlng)
		.setContent("Position: <b>" + e.latlng.toString() + "</b>")
		.openOn(map1);
}

map1.on('click', onMapClick);

// d3 map data
var svgMap = d3.select(map1.getPanes().overlayPane).append("svg"),
	g = svgMap.append("g").attr("class", "leaflet-zoom-hide regions"),
	g_circles = svgMap.append("g").attr("class", "leaflet-zoom-hide");

	var tool = d3.select("body").append("div")
				.attr("class", "tooltipMap")
				.style("opacity", "0")
				.style("display", "none");

	d3.json("../data/casos_comunidad.json", function(error, collection) {
			if (error) throw error;

			/* Add a LatLng object to each item in the dataset */
			collection.objects.forEach(function(d) {
				d.LatLng = new L.LatLng(d.circle.coordenadas[0],
											d.circle.coordenadas[1])
			});

			var feature = g_circles.selectAll("circle")
					.data(collection.objects)
					.enter().append("circle")
					.style("stroke", "black")
					.style("stroke-width", "3.5px")
					.style("opacity", .9)
					.style("fill", "steelblue")
					.attr("r", function(d) {
						return 9;
					});

			function generate_text(d) {
				var html_text = "<b>" + d.circle.comunidad + "</b>";
				for (var i = 0; i < d.circle.caso_partido.length; i++) {
    			html_text += "<div style=font-size: 12px'><b></b>" + d.circle.caso_partido[i][0] + " (" + d.circle.caso_partido[i][1] + ")"																																																				+ "</div><br>";
				}
				return html_text;
			}

			$('div#map1 svg g circle').tipsy({
				gravity: 'w',
				html: true,
				title: function() {
					var d = this.__data__;
					var text = generate_text(d);
					return text;
					}
			});

			map1.on("viewreset", update);
			update();
			function update() {

			feature.attr("transform",
					function(d) {
						return "translate("+
							map1.latLngToLayerPoint(d.LatLng).x +","+
							map1.latLngToLayerPoint(d.LatLng).y +")";
						}
					)
				}
		});

// mapdata from: https://ckhickey.cartodb.com/tables/afghanistan_provinces_geometry/public
d3.json("data/spain-communities.geojson", function(error, collection) {
	if (error) throw error;

	var transform = d3.geo.transform({
			point: projectPoint
	}),
	path = d3.geo.path().projection(transform);

	var feature = g.selectAll("path")
		.data(collection.features)
		.enter().append("path");

	var color;

	function getColor(d) {
	return d > 400 ? '#800026' :
				 d > 300  ? '#FC4E2A' :
				 d > 200   ? '#FD8D3C' :
				 d > 100   ? '#FEB24C' :
				 d > 50   ? '#FED976' :
										'#FFEDA0';
	};

	// Handle zoom of the map and repositioning of d3 overlay
	map1.on("viewreset", reset);
	reset();

	// Reposition the SVG to cover the features.
	function reset() {
		var bounds = path.bounds(collection),
			topLeft = bounds[0],
			bottomRight = bounds[1];
		svgMap.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");
		g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
		g_circles.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

		// Add colors and other fillings for every feature
		feature.attr("d", path)

		.style("fill", function()  {
			var randomNumberBetween0and180 = Math.floor(Math.random() * 500)
    	return getColor(randomNumberBetween0and180)
	  })
		.style("stroke", function(d) {
			return "black";
		})
		.style("stroke-opacity", function(d) {
			return .8;
		})
		.style("stroke-width", function(d) {
			return "2.5px";
		})
		.style("opacity", .8)

		// Add and remove a hover effect with tooltip
		.on("mouseover", function(d){
			d3.select(this)
			.transition()
			.duration(500)
			.style("opacity", .5)

		})
		.on("mouseout", function(d){
			d3.select(this)
				.transition()
				.duration(500)
				.style("opacity", .8)
		});
	}

	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map1.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
});
