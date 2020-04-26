

let apiKey = "b7e7a4108967b060e9837336efa2aa45";
var cityHistory = JSON.parse(window.localStorage.getItem("history")) || [];

function getTime(){
    $('#header').text(moment().format('MMMM Do YYYY, h:mm:ss a'));

};

$(document).ready(function(){


    getTime();
    setInterval(getTime,1000);

    $("#btnSearch").on("click", function(){
        var cityName = $("#cityName").val().trim();
        getCurrentWeather(cityName);

         $("#cityName").val('');
    });


  $("#searchedDisplay").on("click", "li", function() {
    getCurrentWeather($(this).text());
  });

    if (cityHistory.length > 0) {
        getCurrentWeather(cityHistory[cityHistory.length-1]);
      }
    
      for (var i = 0; i < cityHistory.length; i++) {
        makeCityListItem(cityHistory[i]);
      }

});


function getCurrentWeather(cityName){

    $.ajax({
          type: "GET",
          url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`,
          dataType: "json",
          success: function(data) {
            console.log(data)

            if (cityHistory.indexOf(cityName) === -1) {
                cityHistory.push(cityName);
                window.localStorage.setItem("history", JSON.stringify(cityHistory));
          
                makeCityListItem(cityName);
              }

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
            $('#city').text(data.name + "(" +  new Date().toLocaleDateString() + ")").append(img);
            
            
            
            $('#temp').text( "Tempurature: " + data.main.temp + "°F");
            $('#hum').text( "Humidity: " + data.main.humidity + "%");
            $('#windSpeed').text( "Wind Speed: " + data.wind.speed + "MPH");

            var lat = data.coord.lat;
            var lon = data.coord.lon;
            getUV(lon, lat, cityName);

            }
        });
}

function getUV(lon, lat, cityName){
     
    


    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`,
        dataType: "json",
        success: function(data) {
          console.log(data)

          
          var uvValue = data.value;
            if (uvValue < 3){

                var span =  $('<span>').addClass('btn btn-xs btn-success').text( uvValue);
                $('#uvIndex').text("UV Index: ").append(span);
              
            } else if (uvValue < 7){
                var span =  $('<span>').addClass('btn btn-xs btn-warning').text( uvValue);
                $('#uvIndex').text("UV Index: ").append(span);
            } else {
                var span =  $('<span>').addClass('btn btn-xs btn-danger').text( uvValue);
                $('#uvIndex').text("UV Index: ").append(span);
            }

            get5day(cityName);
        }

    });
}

function get5day(cityName){
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`,
        dataType: "json",
        success: function(data) {
          console.log(data)
            // Now we dynamically create the row and append it to the html
          $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

          for (var i = 0; i < data.list.length; i++) {
            // only look at forecasts around 3:00pm
            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
              // create html elements for a bootstrap card
              var col = $("<div>").addClass("col-md-2.4");
              var card = $("<div>").addClass("card bg-success text-white");
              var body = $("<div>").addClass("card-body p-2");
  
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
  
              var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
  
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
  
              // merge together and put on page
              col.append(card.append(body.append(title, img, p1, p2)));
              $("#forecast .row").append(col);
            }

        }
    }
    })
}




function makeCityListItem(cityName) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(cityName);
    $("#searchedDisplay").append(li);
}
