$(document).ready(function() {
    
    var cities; //collection of leaflet layers - one for each city
    var citiesArray = []; //collection of city layers
    var currentCity = 1; //the order number of the currently selected city
    
    //set the sizes and keep them up to date
    var h; //create the variable for height
    resize();
    window.onresize = resize();
    
    
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
    

    
    //use jquery to get the GeoJSON data and send it to be processed into a
    //Feature Collection Object called "data." This object is then passed to the .done method to be used in the 
	//anonymous function to complete the process. Need to do this for L.geoJson to work
	//(needs it processed into a collection of geoJSON features) if it failed, it'll excecute the alert    
	$.getJSON("data/citrip.geojson").done(function(data) {
        //create the city markers
        markCities(data);
        console.log(data)
        //create an array of city features from the processed data - easier to access properties
        citiesArray = data.features;
        //set up the navigation
        navigate();

        
	}).fail(function() {alert ("There has been a problem loading the data.")}); 

    
    
    
    //=============FUNCTIONS=====================//
    
    //creates the city array

    
    //adds event listeners for click the previous and next arrows
    function navigate() {
        var newCity; //the updated city number
        //for clicking the previous arrow
        $("#previous").on("click", function (e) {
            newCity = currentCity - 1;
            if (newCity < 1) {
                currentCity = citiesArray.length;
            }
            else {
                currentCity = newCity;
            }
            console.log("previous!")
            updateContent();
        });
        
        //for clicking the next arrow
        $("#next").on("click", function (e) {
            newCity = currentCity + 1;
            if (newCity > citiesArray.length) {
                currentCity = 1
            }
            else {
                currentCity = newCity;
            }
            console.log("next!")
            updateContent();
        });
        
    }; //end navigate function
    
    
    //adds the cities markers to the map
    function markCities(data) {
        //create the cities layers
        cities = L.geoJson(data, {
            onEachFeature: onEachCity,
            pointToLayer: makeMarker
            
        }).addTo(map) //.on("click", function (e) {
            //$("#titleText").text(" " + e.layer.feature.properties.Order + ". " + e.layer.feature.properties.City + " ");
        //}).addTo(map);  

        
    }; //end markCities function
    
    
    //creates the marker icon
    function makeMarker(feature, latlng) {
        return L.marker(latlng)
    }; //end makeMarker
    
    
    //for each feature
    function onEachCity(feature, layer) {
        //binds the popup
        layer.bindPopup(feature.properties.City);
        
        
        //function for every time a city is clicked - could replace the .on in markCities
        layer.on("click", function (e) {
            currentCity = feature.properties.Order;
            updateContent();
        })
    }; //end onEachCity
    
    //changes the sidebar content based on the current city
    function updateContent() {
        //select a feature to look at
        //does this based off of the current city number - 1 to equal the correct position in the cities array
        var feature = citiesArray[currentCity - 1]
        //updates the title text
        $("#titleText").text(" " + feature.properties.Order + ". " + feature.properties.City + " ");
        
    }//end update content
    
    
    //resizes the elements based off of screen height
    function resize() {
        h = window.innerHeight
        $("#map").css("height", h);
        $("#sidebar").css("height", h);
    }
    
    
}) //end document ready function