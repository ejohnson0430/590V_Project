//Width and height of map
var width = 1500;
var height = 800;

// D3 Projection
var projection = d3.geo.albersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([1650]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

		
// Define linear scale for output
var color = d3.scale.linear()
			  .range(["rgb(213,222,217)","rgb(213,222,217)","rgb(213,222,217)","rgb(213,222,217)"]);


// // D3 Projection
// var projection = d3.geoAlbersUsa()
// 				   .translate([width/2, height/2])    // translate to center of screen
// 				   .scale([1500]);          // scale things down so see entire US

// // Define path generator
// var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
// 		  	 .projection(projection);  // tell path generator to use albersUsa projection

		
// // Define linear scale for output
// var color = d3.scaleLinear()
// 			  .range(["rgb(211,211,211)","rgb(211,211,211)","rgb(211,211,211)","rgb(211,211,211)"]);

var legendText = ["MLB", "NFL", "NHL", "NBA"];

//Create SVG element and append map to the SVG
var svg = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
		    .append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);

// Load in my states data!
d3.csv("stateslived.csv", function(data) {
	color.domain([0,1,2,3]); // setting the range of the input data

	// Load GeoJSON data and merge with states data
	d3.json("us-states.json", function(json) {

		// Loop through each state data value in the .csv file
		for (var i = 0; i < data.length; i++) {

			// Grab State Name
			var dataState = data[i].state;

			// Grab data value 
			var dataValue = data[i].visited;

			// Find the corresponding state inside the GeoJSON
			for (var j = 0; j < json.features.length; j++)  {
				var jsonState = json.features[j].properties.name;

				if (dataState == jsonState) {

				// Copy the data value into the JSON
				json.features[j].properties.visited = dataValue; 

				// Stop looking through the JSON
				break;
				}
			}
		}
		
		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d) {

				// Get data value
				var value = d.properties.visited;

				if (value) {
				//If value exists…
				return color(value);
				} else {
				//If value is undefined…
				return "rgb(213,222,217)";
				}
			});


	    var pieColor = d3.scale.category10();
		pieColor.domain([0, 1, 2, 3])

		d3.csv("titles_by_sport.csv", function(data){

			var pie = svg.selectAll('.pie')
        		.data(data);

	      	pie.enter().append('g')
		        .attr('class', '.pie')
	    		.attr("fill", "red")
				.attr("transform",function(d) { return "translate("+projection([d.lon,d.lat])+")" })
				.on("mouseover", function(d) {      
					div.transition()      
			      	   .duration(200)      
			           .style("opacity", .9);      
			           div.text(d.city + ", Population: " + d.population)
			           .style("left", (d3.event.pageX ) + "px")     
					   .style("top", (d3.event.pageY - 28) + "px");
				})   
			    .on("mouseout", function(d) {       
		        div.transition()        
		           .duration(500)      
		           .style("opacity", 0);   
			    });

			pie.append("circle")
				.attr("r", 0.5)
		        .style("fill", "red");

		    var pieData = d3.layout.pie()
          		.value(function(d) { return d.wins; });

	      	var g = pie.selectAll('g')
		        .data(function(d) {
		        	var pieSize = parseInt(d.total);
		        	var wins = [parseInt(d.mlb), parseInt(d.nfl), parseInt(d.nhl), parseInt(d.nba)]
		        	wins = wins.map(function(t) { return {wins: t, pieSize: pieSize}; });
		         	return pieData(wins);
		        });

      		g.enter().append('g') // create g elements inside each pie
        		.attr('class', 'arc')

      		var arc = d3.svg.arc()
        		.outerRadius(function (d) {
          			return Math.sqrt(d.data.pieSize) * 3.5
        		})
        		.innerRadius(0);

	 	    g.append('path')
	        	.attr("fill", function(d, i) { return pieColor(i); } )
	        	.attr('d', arc)
		});

		// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
		var legend = d3.select("body").append("svg")
		      			.attr("class", "legend")
		     			.attr("width", 140)
		    			.attr("height", 200)
		   				.selectAll("g")
		   				.data(pieColor.domain().slice())
		   				.enter()
		   				.append("g")
		     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			  .attr("width", 18)
			  .attr("height", 18)
			  .style("fill", pieColor);

		legend.append("text")
			  .data(legendText)
			  .attr("x", 24)
			  .attr("y", 9)
			  .attr("dy", ".35em")
			  .text(function(d) { return d; });
	});
});