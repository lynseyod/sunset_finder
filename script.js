const sunsetFinder = {};
sunsetFinder.key = "e990312509fe5adafa3aa72078a8db3c"

//assigning possible weather conditions to 'positive' and 'negative'
//this will affect the final output sentence.
sunsetFinder.weatherConditions = [
  {
    name: "Sun",
    pos: true
  },
  {
    name: "Clear",
    pos: true
  },
  {
    name: "Rain",
    pos: false,
  },
  {
    name: "Cloud",
    pos: false
  },
  {
    name: "Snow",
    pos: false
  },
  {
    name: "Extreme",
    pos: false
  }
];


// pulls the country code from a public API
// two-digit code is required for the main weather api.
sunsetFinder.getCode = function(countryName){
  const countryCodePromise = $.ajax({
    url: `https://restcountries.eu/rest/v2/name/${countryName}`,
    method: "GET",
    dataType: "json"
  }).fail(function(error){
    $('.results').html(`<p>Oops! We're having trouble finding you!
    Double check your spelling, and make sure you're using your <em>complete</em> country name (e.g. "United States of America", not just "United States".)`);
  });
  return countryCodePromise;
}

// converst unix time stamp returned by weather api into simple 12hr format.
sunsetFinder.convertSunset = function(unixTime, unixTimeZone){
  const localUnixTime = unixTime+unixTimeZone;
  const sunsetTime = new Date(localUnixTime*1000);
  const hours = (sunsetTime.getUTCHours())-12; //because we know sunset is pm.
  const minutes = sunsetTime.getUTCMinutes();
  
  // found a fun little bug where '7:05' was being printed as '7:5' so now we have to manually append a 0.
  if (minutes < 10) {
    const sunsetTimeToDisplay = `${hours}:0${minutes}`
    return sunsetTimeToDisplay
  } else {
    const sunsetTimeToDisplay = `${hours}:${minutes}`
    return sunsetTimeToDisplay;
  }
}

// literally just prints the time!
sunsetFinder.displayTime = function(sunsetTime) {
  $('.results').html(`<p class="sunset">The sun will set at <span class="sunset-time">${sunsetTime} p.m.</span> today!</p>`)
};

//current weather is passed in as a string.
//figures out if it's a good day or a bad day for a selfie! (the truly important question of our times. #millennial #avocadotoast)
sunsetFinder.displayWeather = function(currentWeather){
  let isTheSkyClear;
  let htmlToAppend;
  sunsetFinder.weatherConditions.forEach((condition) => {
    if (currentWeather.includes(condition.name)){
      isTheSkyClear = condition.pos;
    };
  });
  if (isTheSkyClear === true){
    htmlToAppend = `<p>It's looking good out there! Get that selfie!</p>`
  } else {
    htmlToAppend = `<p>But it's looking like ${currentWeather.toLowerCase()} out there. Will you still look this good tomorrow?</p>`
  };
  $('.results').append(htmlToAppend);
};

// pulls the weather and uses the data to run our other functions!
sunsetFinder.findWeather = function(searchQuery){
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather/`,
    method: "GET",
    dataType: "json",
    data: {
      q: `${searchQuery}`,
      appid: sunsetFinder.key
    }
  }).then(function(data){
    const sunsetTimeToAppend = sunsetFinder.convertSunset(data.sys.sunset, data.timezone);
    sunsetFinder.displayTime(sunsetTimeToAppend);
    sunsetFinder.displayWeather(data.weather[0].main);
  }).fail(function(error){
    $('.results').html(`<p class="error">Oops! We're having trouble finding you!<br>
    Double check your spelling, and make sure you're using your <em>complete</em> country name<br>
    (e.g. "United States of America", not just "United States".)`);
  })
}

// event listener to kick the whole thing off! yay!
sunsetFinder.actuallyFindTheSunset = function(){
  $("form").on("submit", function(event){
    event.preventDefault();
    const city = $("#city").val();
    const country = $("#country").val();
    const countryPromise = sunsetFinder.getCode(country);
    $.when(countryPromise).done(function(countryData){
      const countryCode = countryData[0].alpha2Code;
      sunsetFinder.findWeather(`${city},${countryCode}`)
    });
  });
};

//init
sunsetFinder.init = function(){
  sunsetFinder.actuallyFindTheSunset();
}

//doc ready.
$(function(){
  sunsetFinder.init()
})