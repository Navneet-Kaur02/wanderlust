{/* the mapToken is run in script of show.ejs which will run first because this file is included at end of show.ejs*/}
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({color: "red"})
.setLngLat(listing.geometry.coordinates) //Listing.geometry.coordinates; just like mapToken, it is defined in show.ejs inside script
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`)
.setMaxWidth("300px"))
.addTo(map);

//A ScaleControl control displays the ratio of a distance on the map to the corresponding distance on the ground
const scale = new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'imperial'
});
map.addControl(scale);
scale.setUnit('metric');

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');
