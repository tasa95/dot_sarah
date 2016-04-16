exports.action = function(data, callback, config, SARAH){

  // Retrieve config
  config = config.modules.meteo2;
  
  if (!config.id || !config.day)
  {
    console.log("Missing Meteo config in prop file");
    callback({'tts' : 'configuration invalide'});
    return;
  }
  
  var url = "http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&lang=fr";

  if (data.dictation)
  {
    console.log("Dictation : " + data.dictation);

    if (data.dictation.length > 0 && data.dictation.indexOf("toi à") >= 0)
    {
      var position = data.dictation.indexOf("toi à") + 6;
      var citySearch = data.dictation.substring(position);

      console.log("Ville recherchée : " + citySearch);
      url += "&q=" + encodeURIComponent(citySearch);

      if (data.countryCode)
      {
        url += "," + data.countryCode; // Permet de préciser dans l'url le pays de la ville recherchée
      }
    }
    else
    {
      callback({'tts' : "Je n'ai pas compris"});
      return;
    }
  }
  else
  {
    url += "&id=" + (data.id || config.id);
  }

  var request = require('request');
  
  request({ 'uri' : url , json : true}, function (err, response, body)
  {
    if (err || response.statusCode != 200)
    {
      callback({'tts': "Je n'ai pas trouvé d'information"});
      return;
    }

    var tts = parse(body, data.day || config.day, data.period || false);
    callback({'tts' : tts});
  });
}

var parse = function(body, day, period)
{
  // Récupération du pays avec le Country Code Top-Level Domain
  var ccTLD = require('./ccTLD');
  var country = ccTLD.getCountryWithCCTLD(body.city.country.toLowerCase());

  // --- Ville recherchée ---
  var cityName = body.city.name;

  // Concaténation de la ville et du pays
  if (cityName != '')
  {
    cityName = " à " + cityName;
    if (country != '') {cityName += ", " + country};
  };
  
  // --- Récupération du jour de la semaine ---
  var numDaySearch = false;
  
  if (day == 'lundi')         { numDaySearch = 1;}
  else if (day == 'mardi')    { numDaySearch = 2;}
  else if (day == 'mercredi') { numDaySearch = 3;}
  else if (day == 'jeudi')    { numDaySearch = 4;}
  else if (day == 'vendredi') { numDaySearch = 5;}
  else if (day == 'samedi')   { numDaySearch = 6;}
  else if (day == 'dimanche') { numDaySearch = 0;}

  var today = new Date();
  var numToday = today.getDay();
  var index = 0; // index est égal au jour recherché dans la liste renvoyée par le json

  if (numDaySearch === false)
  {
    index = day; // Dans ce cas, day est un entier (Aujourd'hui : 0), (demain : 1), (après-demain : 2)
  }
  else
  {
    if (numDaySearch >= numToday)
    {
      index = numDaySearch - numToday;
    }
    else
    {
      index = 7 - (numToday - numDaySearch);
    }
  }

  // --- Vérification entre la date du jour et la 1ère date renvoyée par le webservice (décalage GMT) ---
  var firstTimestamp = body.list[0].dt;
  var firstDate = new Date(firstTimestamp*1000);

  if ((firstDate.getDay() == numToday - 1) || (firstDate.getDay() == 6 && numToday == 0))
  {
    index++;

    if (index > 6)
    {
      var tts = "Je n'ai pas encore les prévisions météorologique pour " + firstDate.getDayName();
      return tts;
    }
  }


  // --- Récupération de la date souhaitée ---
  var timestamp = body.list[index].dt;
  var searchDate = new Date(timestamp*1000);
  var searchDateString;
  var conjonction;

  if (searchDate.getDay() == numToday)
  {
    searchDateString = "aujourd'hui";
    conjonction = " est de ";
  }
  else
  {
    // ex : Samedi 29 Juin 2013
    searchDateString = searchDate.getDayName() + ' ' + searchDate.getDate() + ' ' + searchDate.getMonthName() + ' ' + searchDate.getFullYear();
    conjonction = " atteindra ";
  }

  // --- Récupération des températures ---
  var tempString = "";

  if (period !== false)
  {
    var temp = parseInt(body.list[index].temp[period]);
    tempString = "La température prévue ";

    if (period == 'day')
    {
      if (searchDate.getDay() == numToday) {tempString = "La témpérature actuelle";} else {tempString += "dans la journée de #DAY#";}
    }
    else if (period == 'night')
    {
      if (searchDate.getDay() == numToday) {tempString += "cette nuit";} else {tempString += "dans la nuit de #DAY#";}
    }
    else if (period == 'eve')
    {
      if (searchDate.getDay() == numToday) {tempString += "ce soir";} else {tempString += "dans la soirée de #DAY#";}
    }
    else if (period == 'morn')
    {
      if (searchDate.getDay() == numToday) {tempString += "ce matin";} else {tempString += "dans la matinée de #DAY#";}
    }
    else if (period == 'min')
    {
      if (searchDate.getDay() == numToday) {tempString = "La température minimale prévue";} else {tempString = "La température minimale prévue pour #DAY#";}
    }
    else if (period == 'max')
    {
      if (searchDate.getDay() == numToday) {tempString = "La température maximale prévue";} else {tempString = "La température maximale prévue pour #DAY#";}
    }

    tempString += conjonction + temp + "degrés.";
    tempString = tempString.replace('#DAY#', searchDate.getDayName());
  }
  else
  {
    var tempMin = Math.round(parseFloat(body.list[index].temp.min));
    var tempMax = Math.round(parseFloat(body.list[index].temp.max));

    if (searchDate.getDay() == numToday)
    {
      tempString = "Les températures prévues sont de " + tempMin + " degrés pour les minimales et de " + tempMax + " degrés pour les maximales.";
    }
    else
    {
      tempString = "Les températures prévues pour " + searchDate.getDayName() + " atteindront " + tempMin + " degrés pour les minimales";
      tempString += " et " + tempMax + " degrés pour les maximales.";
    }
  }

  var tts = "Voici mes prévisions météorologique,";
  tts += " " + body.list[index].weather[0].description + " prévu " + searchDateString + cityName + ".";
  tts += " " + tempString;
  tts += " L'humidité de l'air" + conjonction + body.list[index].humidity + " %.";
  tts += " La vitesse du vant" + conjonction + parseInt(body.list[index].speed / 1000 * 3600) + " km/h."; // "vant" = "vent" --> pour une meilleure prononciation
  tts += " La pression de l'air" + conjonction + parseInt(body.list[index].pressure) + " mili bar.";
  
  return tts;
}

Date.prototype.getMonthName = function()
{
  var m = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  return m[this.getMonth()];
}

Date.prototype.getDayName = function()
{
  var d = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  return d[this.getDay()];
}
