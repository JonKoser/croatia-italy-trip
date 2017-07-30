// Globals
var citiesArray = []; //collection of city layers
var currentCity = 0; //the order number of the currently selected city
var currentMarker = null; //the marker icon which is currently selected
var markerArray = []; //collection of markers in an array - used to add custom selected icons
var markerNum = 0; //number of the current marker in the marker array - starts at the first;
var tripPath = ""; //the locaiton of the data selected by which trip the user wants to see
var markers = null; //layer group containing marker layers - this is what gets added to the map
var markerCount = 0; //I suck, so here's a global iterator - number of markers currently on the map
var citiesInfo = null; // the info object containing pictures, city descriptions, and entries
var h = 0; //create the variable for height
var map = null; // the map
var selectedIcon = null;
var nonSelectedIcon = null;
var nonSelectedIcon = null;
    
//=============FUNCTIONS=====================//
function closeGallery() {
    "use strict";
    $("#galleryButton").on("click", function () {
        if ($("#gallery").css("height") === "175px") {
            $("#gallery").css("height", "30px");
            $("#gallery").css("margin-top", h - 30);
            $("#galleryContent").css("visibility", "hidden");
            $(".gallery-image").css("display", "none");
        } else if ($("#gallery").css("height") === "30px") {
            $("#gallery").css("height", "175px");
            $("#gallery").css("margin-top", h - 175);
            $("#galleryContent").css("visibility", "visible");
            $(".gallery-image").css("display", "inline-block");
        }
    });
}

//updates the selected marker
function updateMarker(oldMarker) {
    "use strict";
    markerArray[oldMarker].setIcon(nonSelectedIcon);
    //markerArray[oldMarker].setZIndexOffset(0);
    markerArray[markerNum].setIcon(selectedIcon);
    //markerArray[markerNum].setZIndexOffset(1000);
    //sets the current marker
    currentMarker = markerArray[markerNum];

} //end update Marker

//creates the markers
function makeMarker(feature, latlng) {
    "use strict";
    //gives Rovinj a red marker to begin with
    var useIcon, newMarker;
    if (feature.properties.Order === 1) {
        useIcon = selectedIcon;
    } else {
        useIcon = nonSelectedIcon;
    }
    //creates the new marker
    newMarker = L.marker(latlng, {icon: useIcon, markerID: feature.properties.Order}).on('click', function (e) {
        //makes sure that current marker has a value before it sets the icon on it
        if (currentMarker !== null) {
            //sets the old red marker back to the blue one
            currentMarker.setIcon(nonSelectedIcon);
        }
        //sets the clicked icon (e.target) to the red one
        e.target.setIcon(selectedIcon);
        //resets the z index
        //currentMarker.setZIndexOffset(0);
        //assigns the currently selected marker as the one that was clicked
        currentMarker = e.target;
        //need to set the marker number on click, too. The marker number is one less than the order order in the list
        markerNum = feature.properties.Order - 1;

    });

    //sets the current marker with the one associated with the first city when currentMarker doesn't yet have a value
    if (currentMarker === null && feature.properties.Order === 1) {
        //assigns the current marker to the marker corresponding to the first city in the order (Rovinj)
        currentMarker = newMarker;
        markerNum = markerCount;
        //currentMarker.setZIndexOffset(1000);
    }

    //add the marker to the array
    markerArray.push(newMarker);
    markerCount = markerCount + 1;

    return newMarker;
} //end makeMarker

//returns the city object containing image paths and journal entries based off of the city ID
function findCityInfoObject(cityID) {
    "use strict";
    var cityInfoObj, i;
    for (i = 0; i < citiesInfo.length; i++) {
        if (cityID === citiesInfo[i].cityID) {
            cityInfoObj = citiesInfo[i];
            return cityInfoObj;
        }
    }
} //end find city info objct

//creates the accordion in the sidebar
function updateAccordion(cityInfo) {
    "use strict";
    var i, cityContent;
    //clear the current accordion
    $("#accordion").html("");

    cityContent = cityInfo.content;
    for (i = 0; i < cityContent.length; i++) {
        $("#accordion").append("<h3>" + cityContent[i].date + "</h3>");
        $("#accordion").append("<div>" + cityContent[i].info + "</div>");
    }

    //need to refresh the accordion with the new data since the DOM changed
    $("#accordion").accordion('refresh');

} //end create accordion

//changes the page content based on the current city
function updateContent() {
    "use strict";
    var feature, cityID, cityInfo, images, cityName, numPics, contentWidth;
    //select a feature to look at
    //does this based off of the current city number - 1 to equal the correct position in the cities array
    feature = citiesArray[currentCity - 1];
    //gets the name of the current city
    cityID = feature.properties.ID;

    //gets all the info and image paths on the city
    cityInfo = findCityInfoObject(cityID);

    //updates the title text
    $("#titleText").text(" " + feature.properties.Order + ". " + feature.properties.City + " ");
    
    //clear the existing html
    $("#galleryContent").html("");

    //gets the image paths from the cityInfo json object
    images = cityInfo.images;
    cityName = cityInfo.name;

    //clear the existing image
    $("#sidebarImageSection").html("");
    //inserts the city cover image - the first one for that city - if any exist
    if (images.length > 0) {
        $("#sidebarImageSection").html("<img id='sidebarImage' src=./img/" + tripPath + "/" + cityInfo.name + "/" + images[0].path + ">");
    }

    //puts the correct info in the accordion
    updateAccordion(cityInfo);

    //on each element in the image paths array it adds a lightbox element
    numPics = 0; //number of pictures for the current city
    $.each(images, function (index, data) {
        var path = "<span><a class='fancybox' rel='group' href='img/" + tripPath + "/" + cityName + "/" + data.path + "'><img class='gallery-image' src='img/" + tripPath + "/" + cityName + "/" + data.path + "' alt='image' /></a></span>";
        $("#galleryContent").append(path);
        numPics++;
    });

    //updates the size of the galleryContent box based on how many picures there are (uses an average of 185 px width per picture)
    contentWidth = numPics * 185;
    $("#galleryContent").css("width", contentWidth);

    //if there aren't any pictures for a city, will not show the gallery bar
    if (numPics === 0) {
        $("#gallery").css("visibility", "hidden");
    } else {
        $("#gallery").css("visibility", "visible");
    }
}//end update content

//for each feature
function onEachCity(feature, layer) {
    "use strict";
    //function for every time a city is clicked
    layer.on("click", function (e) {
        currentCity = feature.properties.Order;
        updateContent();
    });
} //end onEachCity

//adds the cities markers to the map
function markCities(data) {
    "use strict";
    markerArray = [];
    if (markers !== null) {
        markers.clearLayers();
    }
    //create the cities layers
    var cities = L.geoJson(data, {
        onEachFeature: onEachCity,
        pointToLayer: makeMarker
    });
    markers = L.layerGroup(markerArray).addTo(map);
}//end markCities function

//initializes the accordion
function setUpAccordion() {
    "use strict";
    $("#accordion").accordion({
        collapsible: true,
        heightStyle: "content",
        active: false
    }).accordion('refresh');
} //end set up accordion

//resizes the elements based off of screen height
function resize() {
    "use strict";
    h = window.innerHeight;
    $("#map").css("height", h);
    $("#sidebar").css("height", h);
    $("#gallery").css("margin-top", h - 175);
}

//loads the data for the selected trip
function loadTripData() {
    "use strict";
    currentMarker = null; //makes sure that we start from scratch
    markerCount = 0; //make sure that we start from scratch

    //json containing city info and image paths
    $.getJSON("data/" + tripPath + "/content.json").done(function (data) {
        citiesInfo = data.cities;
    });

    //use jquery to get the GeoJSON data and send it to be processed into a
    //Feature Collection Object called "data." This object is then passed to the .done method to be used in the 
    //anonymous function to complete the process. Need to do this for L.geoJson to work
    //(needs it processed into a collection of geoJSON features) if it failed, it'll excecute the alert    
    $.getJSON("data/" + tripPath + "/coords.geojson").done(function (data) {

        //for first load, set current city to the first city
        currentCity = 1;
        //create the city markers
        markCities(data);
        //create an array of city features from the processed data - easier to access properties
        citiesArray = data.features;
        //load the sidebar content
        updateContent();


    }).fail(function () {alert("There has been a problem loading the data."); });
}

//selects which trip path is going to be used
function tripSelect() {
    "use strict";
    //the center of the map - set at Croatia's initially
    //the desired zoom level - set at 7 initially
    var center = L.latLng(44.8, 15.3), zoom = 7;
    tripPath = "Croatia"; //initially sets the path to Croatia
    //adds an event listener for when the trip is changed
    $("#dropdown").on("change", function () {
        var selectedTrip = $("#dropdown").val();
        switch (selectedTrip) {
        case "Croatia":
            center = L.latLng(44.8, 15.3);
            tripPath = "Croatia";
            zoom = 7;
            break;
        case "China":
            center = L.latLng(13, 115);
            tripPath = "China";
            zoom = 4;
            break;
        case "Honeymoon":
            center = L.latLng(52, -2);
            tripPath = "Honeymoon";
            zoom = 4;
            break;
        }

        map.setView(center, zoom);
        loadTripData();
    });
    map.setView(center, zoom);
    loadTripData();
}

//adds event listeners for click the previous and next arrows
//so the main issue with this function is that it is dependent on the list being in order.
//I should fix that at some point. All the property info is in each marker, I should keep that
//in mind.
function navigate() {
    "use strict";
    var newCity, oldMarker; //the old marker number
    //var oldZ; //the old Z value
    //for clicking the previous arrow
    $("#previous").on("click", function (e) {
        newCity = currentCity - 1;
        oldMarker = markerNum;
        if (newCity < 1) {
            currentCity = citiesArray.length;
            markerNum = citiesArray.length - 1;
        } else {
            currentCity = newCity;
            markerNum = markerNum - 1;
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
        } else {
            currentCity = newCity;
            markerNum++;
        }
        updateContent();
        updateMarker(oldMarker);
    });

} //end navigate function


//=======ACTUAL CODE=====//
$(document).ready(function () {
    "use strict";
    //set the sizes and keep them up to date
    resize(); //call it once to get initial sizes
    window.onresize = resize(); //call it whenever the window resizes

    
    //set up a basic map window by selecting the "map" div element in index.html
	map = L.map("map", {
		minZoom: 3
	});
    
    //createes the "selected" icon
    selectedIcon = L.icon({
        iconUrl: 'js/images/marker-icon-red.png',
        iconRetinaUrl: 'js/images/marker-icon-2x-red.png',
        shadowUrl: 'js/images/marker-shadow.png',
        popupAnchor: [0, -40],
        iconAnchor: [13, 40]
    });
    
    nonSelectedIcon = L.icon({
        iconUrl: 'js/images/marker-icon.png',
        iconRetinaUrl: 'js/images/marker-icon-2x.png',
        shadowUrl: 'js/images/marker-shadow.png',
        popupAnchor: [0, -40],
        iconAnchor: [13, 40]
    });
    
    //identify which tile layer to use and then add it to the map
	L.tileLayer(
		'https://api.mapbox.com/styles/v1/jkoser/cio79mjga000maem582l5vmrw/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiamtvc2VyIiwiYSI6ImNpbWtxNTg2NzAxNGl2cGtnY3k1dGU3aXEifQ.VbZ8l9bL6wsh8dgaI8gTuw',
        { attribution: 'Custom map layer made using MapBox Studio by Jon Koser' }
    ).addTo(map);
    

    //initialize fancybox lightbox
    $(".fancybox").fancybox();
        
    //lets people select which trip to look at
    tripSelect();

    //sets up closing the gallery
    closeGallery();
    
    //set up the navigation
    navigate();
    
    //initialized the accordion
    setUpAccordion();
    
});