$(document).ready(function() {
    
    var citiesArray = []; //collection of city layers
    var currentCity; //the order number of the currently selected city
    var currentMarker; //the marker icon which is currently selected
    var markerArray = []; //collection of markers
    var markerNum; //number of the current marker in the marker array - starts at the first;
    var imageArray = [] //array of image paths by city;
    
    //set the sizes and keep them up to date
    var h; //create the variable for height
    resize();
    window.onresize = resize();
    
    
    //set up a basic map window by selecting the "map" div element in index.html
	var map = L.map("map", {
		center: [44.8, 15.3],
		zoom: 7,
		minZoom: 3
	});
    
    //createes the "selected" icon
    var selectedIcon = L.icon({
        iconUrl: 'js/images/marker-icon-red.png',
        iconRetinaUrl: 'js/images/marker-icon-2x-red.png',
        shadowUrl: 'js/images/marker-shadow.png',
        popupAnchor: [0,-40],
        iconAnchor: [13,40]
    });
    
    var nonSelectedIcon = L.icon ({
        iconUrl: 'js/images/marker-icon.png',
        iconRetinaUrl: 'js/images/marker-icon-2x.png',
        shadowUrl: 'js/images/marker-shadow.png',
        popupAnchor: [0,-40],
        iconAnchor: [13,40]
    })
    
    //identify which tile layer to use and then add it to the map
	L.tileLayer(
		'http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
			attribution: "Open Street Map Tiles" }).addTo(map);
    

    //initialize fancybox lightbox
    $(".fancybox").fancybox();
    
    //gets images JSON file and turns it into an array
    $.getJSON("data/images.json").done(function(data) {
        imagePaths = data.images;
        
    })
    
    //use jquery to get the GeoJSON data and send it to be processed into a
    //Feature Collection Object called "data." This object is then passed to the .done method to be used in the 
	//anonymous function to complete the process. Need to do this for L.geoJson to work
	//(needs it processed into a collection of geoJSON features) if it failed, it'll excecute the alert    
	$.getJSON("data/citrip.geojson").done(function(data) {
        
        //for first load, set current city to Rovinj
        currentCity = 1;
        //create the city markers
        markCities(data);
        //create an array of city features from the processed data - easier to access properties
        citiesArray = data.features;
        //set up the navigation
        navigate();
        //load the sidebar content
        updateContent();
        //sets up closing the gallery
        closeGallery();
    
        
	}).fail(function() {alert ("There has been a problem loading the data.")}); 
    
    
    //=============FUNCTIONS=====================//
    
    
    function closeGallery() {
        $("#galleryButton").on("click", function () {
            if ($("#gallery").css("height") == "175px"){
                $("#gallery").css("height", "20px");
                $("#gallery").css("margin-top", h-20);
                $("#galleryContent").css("visibility", "hidden");
                $(".gallery-image").css("display", "none");
            }
            else if ($("#gallery").css("height") == "20px") {
                $("#gallery").css("height", "175px");
                $("#gallery").css("margin-top", h-175);
                $("#galleryContent").css("visibility", "visible");
                $(".gallery-image").css("display", "inline-block");
            }

        })
    }
    
    
    //adds event listeners for click the previous and next arrows
    //so the main issue with this function is that it is dependent on the list being in order.
    //I should fix that at some point. All the property info is in each marker, I should keep that
    //in mind.
    function navigate() {
        var newCity; //the updated city number
        var oldMarker; //the old marker number
        var oldZ; //the old Z value
        //for clicking the previous arrow
        $("#previous").on("click", function (e) {
            newCity = currentCity - 1;
            oldMarker = markerNum;
            if (newCity < 1) {
                currentCity = citiesArray.length;
                markerNum = citiesArray.length - 1;
            }
            else {
                currentCity = newCity;
                markerNum --;
            }
            updateContent();
            updateMarker(oldMarker);
        });
        
        //for clicking the next arrow
        $("#next").on("click", function (e) {
            newCity = currentCity + 1;
            oldMarker = markerNum;
            if (newCity > citiesArray.length) {
                currentCity = 1;
                markerNum = 0;
            }
            else {
                currentCity = newCity;
                markerNum ++;
            }
            updateContent();
            updateMarker(oldMarker);
        });
        
    }; //end navigate function
    
    //updates the selected marker
    function updateMarker(oldMarker) {
        markerArray[oldMarker].setIcon(nonSelectedIcon);
        //markerArray[oldMarker].setZIndexOffset(0);
        markerArray[markerNum].setIcon(selectedIcon);
        //markerArray[markerNum].setZIndexOffset(1000);
        //sets the current marker
        currentMarker = markerArray[markerNum];
        
    } //end update Marker
    
    //adds the cities markers to the map
    function markCities(data) {
        //create the cities layers
        var cities = L.geoJson(data, {
            onEachFeature: onEachCity,
            pointToLayer: makeMarker
            
        }).addTo(map) //.on("click", function (e) {
            //$("#titleText").text(" " + e.layer.feature.properties.Order + ". " + e.layer.feature.properties.City + " ");
        //}).addTo(map);  

        
    }; //end markCities function
    
    //creates the markers
    var i = 0; //I suck, so here's a global iterator for the following function because scope is annoying, haha
    function makeMarker(feature, latlng) {   
        //gives Rovinj a red marker to begin with
        var useIcon;
        if (feature.properties.Order == 1) {
            useIcon = selectedIcon;
        }
        else {
            useIcon = nonSelectedIcon;
        }
        //creates the new marker
        var newMarker = L.marker(latlng, {icon: useIcon, markerID: feature.properties.Order}).on('click', function (e) {
            //makes sure that current marker has a value before it sets the icon on it
            if (currentMarker != null) {
                //sets the old red marker back to the blue one
                currentMarker.setIcon(nonSelectedIcon)
            };
            //sets the clicked icon (e.target) to the red one
            e.target.setIcon(selectedIcon);
            //resets the z index
            //currentMarker.setZIndexOffset(0);
            //assigns the currently selected marker as the one that was clicked
            currentMarker = e.target;
            
            //need to set the marker number on click, too. The marker number is one less than the order order in the list
            markerNum = feature.properties.Order - 1;

        })
        
        //sets the current marker with the one associated with the first city when currentMarker doesn't yet have a value
        if (currentMarker == null && feature.properties.Order == 1) {
            //assigns the current marker to the marker corresponding to the first city in the order (Rovinj)
            currentMarker = newMarker;
            markerNum = i;
            //currentMarker.setZIndexOffset(1000);
        };
        
        //add the marker to the array
        markerArray.push(newMarker)
        i ++;
        
        return newMarker;
    }; //end makeMarker
    
    
    //for each feature
    function onEachCity(feature, layer) {
        //binds the popup
        //layer.bindPopup(feature.properties.City);
        //function for every time a city is clicked - could replace the .on in markCities
        layer.on("click", function (e) {
            currentCity = feature.properties.Order;
            updateContent();
        })
    }; //end onEachCity
    
    //changes the page content based on the current city
    function updateContent() {
        //select a feature to look at
        //does this based off of the current city number - 1 to equal the correct position in the cities array
        var feature = citiesArray[currentCity - 1]
        //gets the name of the current city
        var cityID = feature.properties.ID;
        
        //updates the title text
        $("#titleText").text(" " + feature.properties.Order + ". " + feature.properties.City + " ");                
        $("#sidebarContent").load("cities/" + cityID + ".html");
        //$("#galleryContent").load("cities/" + cityID + "-images.html");
        
        //clear the existing html
        $("#galleryContent").html("");
        //gets the city's image file paths as an array - looks at the position in the cities array we are at and then drills down into the city
        var images = imagePaths[currentCity-1][cityID];
        
        //on each element in the image paths array it adds a lightbox element
        var numPics = 0; //number of pictures for the current city
        $.each(images, function(index, data) {
            var path = "<span><a class='fancybox' rel='group' href='" + data.path + "'><img class='gallery-image' src='" + data.path + "' alt='image' /></a></span>"
            $("#galleryContent").append(path);
            numPics ++;
        })
        
        //updates the size of the galleryContent box based on how many picures there are (uses an average of 250 px width per picture)
        var contentWidth = numPics*225;
        $("#galleryContent").css("width", contentWidth);
        
        //if there aren't any pictures for a city, will not show the gallery bar
        if (numPics == 0) {
            $("#gallery").css("visibility", "hidden");
        }
        else {
            $("#gallery").css("visibility", "visible");
        }


    }//end update content
    
    
    //resizes the elements based off of screen height
    function resize() {
        h = window.innerHeight
        $("#map").css("height", h);
        $("#sidebar").css("height", h);
        $("#gallery").css("margin-top", h-175)
    }
    
    
}) //end document ready function