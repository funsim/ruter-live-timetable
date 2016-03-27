stop_ids = {"Skøyen": 3012501,
            "IT Fornebu": 2190018,
           };

function secondsToHms(d) {
    d = Number(d);
    var h = Math.max(Math.floor(d / 3600), 0);
    var m = Math.max(Math.floor(d % 3600 / 60), 0);
    var s = Math.max(Math.floor(d % 3600 % 60), 0);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

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
            if (key > 5) {
                return true;
            }
            departureTime = Date.parse(val.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime);
            waitingTimeSeconds = (departureTime - Date.now())/1000;
            waitingTime = secondsToHms(waitingTimeSeconds);
            line = val.MonitoredVehicleJourney.PublishedLineName;
            destination = val.MonitoredVehicleJourney.MonitoredCall.DestinationDisplay;

            items.push( "<tr id='" + key + "'>");
            items.push( "<td class=\"align_right\">" + line + "</td>" );
            items.push( "<td>" + destination + "</td>" );
            items.push( "<td class=\"countdown align_right\" value=\"" + waitingTimeSeconds + "\">" + waitingTime + "</td>" );
            items.push( "</tr>");
          });

          $( "<table/>", {
            "class": "table",
            html: items.join( "" )
          }).appendTo( "#departuretimes" );

          window.setInterval(countdown, 1000);
        });
}

function countdown() {
    $('.countdown').each(function( index ) {
        newtime = Number($(this).attr("value")) - 1;

        // Delete old departures
        if (newtime < -30) {
            var target = $(this).closest("tr");
            target.hide('slow', function(){ target.remove(); });
        }

        // Mark upcoming departures
        if (newtime < 3*60) {
            $(this).closest("tr").addClass("emphasize");
        }
        if (newtime < 1*60) {
            $(this).closest("tr").removeClass("emphasize").addClass("urgent");
        }

        $(this).attr("value", newtime);
        $(this).html(secondsToHms(newtime));
    });
}

$(document).ready(function(){
loadTimes(stop_ids["Skøyen"]);
//loadStops();

setTimeout(function(){ window.location.reload(1);}, 60*1000);
})
