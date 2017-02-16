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
	center: [40.711510, -73.935242],
	zoom: 11,
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

// d3 map data
var svgMap = d3.select(map1.getPanes().overlayPane).append("svg"),
	g = svgMap.append("g").attr("class", "leaflet-zoom-hide regions"),
	g_circles = svgMap.append("g").attr("class", "leaflet-zoom-hide");

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

 // Setting color domains(intervals of values) for our map

var color_domain = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.01]
var legend_labels = ["0.1+", "0.2+", "0.3+", "0.4+", "0.5+", "0.6+", "0.7+", "0.8+", "0.9+"]              

var color = d3.scale.threshold()
  .domain(color_domain)
  .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)",
  		"rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(8,48,107)"]);


d3.json("data/taxi_zones/taxi_zones.geojson", function(error, collection) {

	if (error) throw error;

	var transform = d3.geo.transform({
			point: projectPoint
	}),
	path = d3.geo.path().projection(transform);

	var feature = g.selectAll("path")
		.data(collection.features)
		.enter().append("path");

	var ID = "1";
	emphasizeRegion(ID);
	drawHeatMap();

	// Handle zoom of the map and repositioning of d3 overlay
	map1.on("viewreset", reset);
	reset();

	d3.selectAll("#opts_v1")
			.on("change",function(){
				ID = d3.select(this).property('value');
				resetRegion();
				emphasizeRegion(ID);
				drawHeatMap(ID);
			})

	function emphasizeRegion(ID){

		d3.select(feature[0][parseInt(ID)-1])
			.attr("d", path)
			.style("stroke", 'black')
       		.style("fill", "#DB7093")
       		.style("stroke-width", 4)
	}

	function resetRegion(){

		// Add colors and other fillings for every feature
		feature.attr("d", path)
		.style("stroke", 'black')
       	.style("fill", "none")
       	.style("stroke-width", 4)
	}

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
			.style("stroke", 'black')
       		.style("fill", "none")
       		.style("stroke-width", 4)

       	d3.select(feature[0][parseInt(ID)-1])
			.attr("d", path)
			.style("stroke", 'black')
       		.style("fill", "#DB7093")
       		.style("stroke-width", 4)

       	drawHeatMap()
	}

	function drawHeatMap(ID){

		d3.csv("data/temp.csv", function(data){

			var corrById = {};
			var nameById = {};

	   		data.forEach(function(d) {
	    		corrById[d.ID] = d.Corr;
	    		nameById[d.ID] = d.ID;
	  		});
	   		
	   		feature.attr("d", path)
	   			.style("fill", function(d, i){
	   				if (i != parseInt(ID)-1){
	   					return color(corrById[i+1]);
	   				}
	   				else{
	   					return "#DB7093"
	   				}
	  			})
				.style("opacity", .9)
				.on("mouseover", function(d, i) {	
					d3.select(this)
						.transition()
						.duration(500)
						.style("opacity", .55)	
            		div.transition()		
                		.duration(200)		
                		.style("opacity", .9);		
            		div	.html("<strong>Correlation:</strong> <span style='color:#8B0000'>" + parseFloat(corrById[i+1]).toFixed(4) + "</span>")	
                		.style("left", (d3.event.pageX + 16) + "px")		
                		.style("top", (d3.event.pageY + 16) + "px")})
                .on("mouseout", function(d) {	
                	d3.select(this)
						.transition()
						.duration(500)
						.style("opacity", .9)	
            		div.transition()		
                		.duration(500)		
                		.style("opacity", 0);				   
				})
		});
	}

	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map1.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
});
