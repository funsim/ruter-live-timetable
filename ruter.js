stop_ids = {"Skøyen": 3012501,
            "IT Fornebu": 2190018,
           };

function loadJSONCrossOrigin(url, callback)
{
    $.getJSON("http://query.yahooapis.com/v1/public/yql",
      {
        q:      "select * from json where url=\"" + url + "\"",
        format: "json"
      },
      function( data ) {
          callback( data.query.results.json.json );
      }
      );
}

function loadStops()
{
        loadJSONCrossOrigin(
          "http://reisapi.ruter.no/Place/GetStopsRuter?json=true",
          function( data ) {
          var items = [];
          $.each( data, function( key, val ) {
            items.push( "<tr id='" + val.ID + "'>");
            items.push( "<td>" + val.Name + "</td>" );
            items.push( "<td>" + val.ID + "</td>" );
            items.push( "</tr>");
          });

          $( "<table/>", {
            "class": "stops-table",
            html: items.join( "" )
          }).appendTo( "body" );
        });
}

function loadTimes(stopID)
{
        loadJSONCrossOrigin(
          "http://reisapi.ruter.no/stopvisit/getdepartures/" + stopID + "?json=true",
          function( data ) {
          var items = [];
          $.each( data, function( key, val ) {
            departureTime = Date.parse(val.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime);
            waitingTime = (departureTime - Date.now())/1000;
            waitingMinutes = Math.floor( waitingTime/60 );
            waitingSeconds = Math.round( waitingTime - waitingMinutes*60 );
            line = val.MonitoredVehicleJourney.PublishedLineName;
            destination = val.MonitoredVehicleJourney.MonitoredCall.DestinationDisplay;

            items.push( "<tr id='" + key + "'>");
            items.push( "<td>" + line + "</td>" );
            items.push( "<td>" + destination + "</td>" );
            //items.push( "<td>" + departureTime + "</td>" );
            items.push( "<td>" + waitingMinutes +":" + waitingSeconds + "</td>" );
            items.push( "</tr>");
          });

          $( "<table/>", {
            "class": "stops-table",
            html: items.join( "" )
          }).appendTo( "body" );
        });
}

$(document).ready(function(){
loadTimes(stop_ids["Skøyen"]);
//loadStops();
})
