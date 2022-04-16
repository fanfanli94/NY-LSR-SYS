//-----------------------------------------------draw the slider-------------------------------------------------------//
var rate_slider = document.getElementById("crime-selector");
noUiSlider.create(rate_slider, {
  start: [0, 5],
  connect: true,
  step: 0.1,
  behaviour: "drag",
  orientation: 'horizontal', // 'horizontal' or 'vertical'
  range: {
    'min': 0,
    'max': 5
  },
  format: wNumb({
    decimals: 1
  }),
  pips: {mode: 'count', values:6, stepped:true}
});

var star_slider = document.getElementById("transp-selector");
noUiSlider.create(star_slider, {
  start: [0, 5],
  connect: true,
  step: 0.1,
  behaviour: "drag",
  orientation: 'horizontal', // 'horizontal' or 'vertical'
  range: {
    'min': 0,
    'max': 5
  },
  format: wNumb({
    decimals: 1
  }),
  pips: {mode: 'count', values:6, stepped:true}
});


//-----------------------------------------------sort the data-------------------------------------------------------//

function dataSort(dataInput){
  //sort by stars then by alphabet
  dataInput.sort(function(a, b) {
    if(a.rating != b.rating){
      return b.rating - a.rating;
    } 
    else {
      var nameA = a.name.toUpperCase(); 
      var nameB = b.name.toUpperCase(); 
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }
  });

  return dataInput;
}

//-----------------------------------------------draw the map-------------------------------------------------------//

//get right list
var apt_list = document.getElementsByClassName("apt");
var center_pos = [40.71427, -74.00597];

var map = L.map("map", {
  center: center_pos, // EDIT latitude, longitude to re-center map
  zoom: 10, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
  scrollWheelZoom: false,
});

var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
  }
).addTo(map);

var markers = new L.MarkerClusterGroup();
var AllData, CurrentData; 
$.get('apartments.csv', function(csvString) {

  // Use PapaParse to convert string to array of objects
  var data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;
  // For each row in data, create a marker and add it to the map
  // For each row, columns `Latitude`, `Longitude`, and `Title` are required
  
  for (var i in data) {
    var row = data[i];
    
    var marker = L.marker([row.latitude, row.longitude], {
      opacity: 1
    }).bindPopup(row.name);

    marker.on("mouseover", function () {
      this.openPopup();
    });

    marker.on("mouseout", function () {
      this.closePopup();
    });

    markers.addLayer(marker);
  }
  map.addLayer(markers);

  //initialize the list
  AllData = data;
  CurrentData = data;
  console.log(AllData);
  console.log(CurrentData);

  for(var i = 0; i < 5; i++){
    apt_list[i].innerHTML=
      "<div class='collapsible-header'>"+
          "<div class='row'>"+
            "<strong>" + AllData[i].name+"</strong><br>" +
          "</div>" 
      "</div>" ;
  }
});
//-----------------------------------------------apartment ranking list-------------------------------------------------------//


var page = 0;

function newPage(index){
  page = index;
  for(var i = 0; i < 5; i++){
    apt_list[i].innerHTML=
      "<div class='collapsible-header'>"+
          "<div class='row'>"+
            "<strong>" + CurrentData[i + 5*page].name+"</strong><br>" +
          "</div>" 
      "</div>" ;
  }
}

function findApt(index){

  var aptdata = CurrentData[index + 5*page];
  var lat = aptdata.latitude
  var lot = aptdata.longitude

  map.setView([lat,lot],20);

}


//-----------------------------------------------click on search filter-------------------------------------------------------//

function Mapclean(){
  //remove all the point on the map
  map.removeLayer(markers);
}

function gettingresult(e){
  Mapclean();
  e.preventDefault();
  var rate = rate_slider.noUiSlider.get().map(val =>{ return parseFloat(val);});
  
  markers = new L.MarkerClusterGroup();

  CurrentData = AllData.filter(d => {
    return d.rating >= rate[0] && d.rating <= rate[1];
  });

  dataSort(CurrentData);
  console.log(CurrentData);

  for (var i in CurrentData) {
    var row = CurrentData[i];
    
    var marker = L.marker([row.latitude, row.longitude], {
      opacity: 1
    }).bindPopup(row.name);
  
    marker.on("mouseover", function () {
      this.openPopup();
    });
  
    marker.on("mouseout", function () {
      this.closePopup();
    });
  
    markers.addLayer(marker);
     
  }
  
  map.addLayer(markers);
}

//-----------------------------------------------apartment name search-------------------------------------------------------//

function searchApt_keyPress(e){
  if(e.keyCode === 13){
    e.preventDefault(); 
    searchApartment(e.currentTarget);
  }
}

function searchApartment(element){
  
  Mapclean();

  if(typeof element === "undefined"){
    element = document.getElementById('search');
  }

  //empty value, turn to all results
  if(element.value === ""){
    markers = new L.MarkerClusterGroup();

    for (var i in CurrentData) {
      var row = CurrentData[i];
    
      var marker = L.marker([row.latitude, row.longitude], {
          opacity: 1
      }).bindPopup(row.name);
  
      marker.on("mouseover", function () {
        this.openPopup();
      });
  
      marker.on("mouseout", function () {
        this.closePopup();
      });
  
      markers.addLayer(marker);
    } 
  
    map.addLayer(markers);
  }else{
   var key_search = element.value.toString().toLowerCase();
    
   markers = new L.MarkerClusterGroup();
   
   CurrentData = AllData.filter(d => {
    return d.name.toLowerCase().includes(key_search);
   });

   dataSort(CurrentData);
   console.log(CurrentData);
   
   for (var i in CurrentData) {
      var row = CurrentData[i];
      
      var marker = L.marker([row.latitude, row.longitude], {
        opacity: 1
      }).bindPopup(row.name);
  
      marker.on("mouseover", function () {
        this.openPopup();
      });
  
      marker.on("mouseout", function () {
        this.closePopup();
      });
  
      markers.addLayer(marker);  
      
   } 
 
   map.addLayer(markers);

  }
}





