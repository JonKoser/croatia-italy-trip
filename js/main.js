$(document).ready(function() {
    
        
    //set up a basic map window by selecting the "map" div element in index.html
	var map = L.map("map", {
		center: [44.5, 13.6],
		zoom: 7,
		maxZoom: 10,
		minZoom: 3
	});
    
    
    //identify which tile layer to use and then add it to the map
	L.tileLayer(
		'http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
			attribution: "Open Street Map Tiles" }).addTo(map);
    

    
    //use jquery to get the GeoJSON data and send it to be processed
	//loads the geojson then passes it to the .done method to be used in the 
	//anonymous function as "data". Need to do this for L.geoJson to work (needs a feature)
	//if it failed, it'll excecute the alert
	$.getJSON("data/citrip.geojson").done(function(data) {
        markCities(data);

        
	}).fail(function() {alert ("There has been a problem loading the data.")}); 
    
    //adds the cities markers to the map
    function markCities(data) {
      cities = L.geoJson(data, {
          pointToLayer: function(feature, latln) {
              return L.circleMarker(latln);
          }
          
      }).addTo(map);  
        
    }; //end markCities function
    
    
    
    
    
    
}) //end document ready function