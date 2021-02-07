console.log('js Loaded');

//request data from API    
function fetchdata() {

    $.ajax({
        url : encodeURI("http://207.251.86.229/nyc-links-cams/LinkSpeedQuery.txt"),
        type: "GET",
        data: {
            // "$limit": 1024,
            // "$$app_token": "ReXNLc0gRAMKhmOChFYGqCdlk"
        },
        beforeSend: function() {
            $("#loaderGif").show();
        },
        complete: function(data) {
            setTimeout(fetchdata, 1800000);
            $("#loaderGif").hide();
            // setTimeout(fetchdata, 15000);
        }

    }).done(function(data) {
            alert("Retrieved " + data.length + " records from the dataset!");
            console.log(data);

            //d3 ___________________________________________________________________                           
});
}






$(document).ready(function() {
    fetchdata();
});
