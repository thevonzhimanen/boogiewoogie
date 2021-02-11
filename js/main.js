console.log('js Loaded');

/*
ORDER OF OPERATIONS:
    go to database/archive
    get first item and place it in the canvas
    get remainder of items and place them in the archive
    if current time is less than 30 minutes since timestamp of last item in archive, then do nothing
    if current time is more than 30 minutes since timestamp of last item in archive, then fetch data etc.
*/

//Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyBdBvm5AKa6fI004M_9jf2n5nyVAHvVdZQ",
    authDomain: "nyc-boogie-woogie.firebaseapp.com",
    databaseURL: "https://nyc-boogie-woogie-default-rtdb.firebaseio.com",
    projectId: "nyc-boogie-woogie",
    storageBucket: "nyc-boogie-woogie.appspot.com",
    messagingSenderId: "973992429447",
    appId: "1:973992429447:web:e4cb07cebb830676d43522"
  };
firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var locRef = db.ref("images");

//before starting the fetchdata function, need to immediately read from archive and put the previous-requested svg on the canvas

function fetcharchive(dataOn){

    //Normally, we would fire the ".on" method for the firebase data, but we already have that data stored in the dataOnce variable.
    
    /*
    //user authentication for security:
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
        var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
    });
    */

/*
        //checking time since last request and proceeding or not proceeding with a new request if it's been more than 30 miutes:
        var timeLastString = Object.keys(dataOn)[Object.keys(dataOn).length - 1].substr(4, Object.keys(dataOn).length);
        var year = timeLastString.split(/-|T|Z/)[0],
            month = timeLastString.split(/-|T|Z/)[1]-1,
            day = timeLastString.split(/-|T|Z/)[2],
            hour = timeLastString.split(/-|T|Z/)[3],
            minute = timeLastString.split(/-|T|Z/)[4],
            second = timeLastString.split(/-|T|Z/)[5],
            millisecond = timeLastString.split(/-|T|Z/)[6];
        console.log(year, month, day, hour, minute, second);
        var timeLast = Date.parse(year, month, day, hour, minute, second, millisecond);
        var timeNow = new Date();
        console.log(timeNow, timeLast, timeLastString);
        var timeDiff = Math.abs(timeNow.getTime() - timeLast.getTime());
        if (timeDiff<1800000){
            //time difference is less than 30 min, do nothing
            console.log(timeLast, timeDiff, "... time is less");
        }
        else {
            console.log(timeDiff, "... time is more");
            //time difference is greater than 30 min, run fetchdata function
        }
                */
        
        //to populate the archive images, iterate over each past data entry
        Object.keys(dataOn).forEach(function(key) {
            console.log("Firebase snapshot: ", key, dataOn[key]);

            //use dataOn[key].data to get the base64 version of each svg;
            var parser = new DOMParser();
            var doc = parser.parseFromString(dataOn[key].data, "text/xml");
            //create svg element, and populate it with the svg xml from the .data branch of the item in the firebase database;
            var svgElement = doc.firstChild;
            svgElement.setAttribute("width", "100%");
            svgElement.setAttribute("height", "auto");
            //svgElement.setAttribute("viewBox", "0 0 1 1");
            
            //archiveElement contains both the svg and its title text:
            var archiveElement = document.createElement("div");
            archiveElement.id = key;
            archiveElement.className = "archive"; 

            //titleElement contains the title text of the svg:
            var titleElement = document.createElement("p");
            var archiveTitle = document.createTextNode(key.substr(4, 22)+":");
            titleElement.appendChild(archiveTitle);
            
            //push both svg and title into the archiveElement, then push that into the Archived Canvases container:
            archiveElement.appendChild(titleElement);
            archiveElement.appendChild(svgElement);
            document.getElementById("archive").appendChild(archiveElement);
            //consider using createDocumentFragment() method?
        
        });
    }

          
//request data from API    
function fetchdata() {
    
    $.ajax({       
        url : encodeURI("https://data.cityofnewyork.us/resource/i4gi-tjb9.json?$order=data_as_of DESC&borough=Manhattan"),
        // url: "https://data.cityofnewyork.us/resource/i4gi-tjb9.json?",
        type: "GET",
        data: {
            "$limit": 1024,
            "$$app_token": "ReXNLc0gRAMKhmOChFYGqCdlk"
        },
        beforeSend: function() {
            // Show image container
            // $("#loaderGif").css("display:block !important");
            $("#loaderGif").show();
        
        },
        
        //automated requests every half hour
        complete: function(data) {
            setTimeout(fetchdata, 1800000);
            $("#loaderGif").hide();
            document.getElementById("mondrian").style.display="none";
        }

    }).done(function(data) {
            alert("Retrieved " + data.length + " records from the dataset!");
            console.log(data);

            //display retrieved data sample in the browser
            $("#date").text("Last updated day: " + data[0]["data_as_of"].substring(0, 10));
            $("#time").text("Last updated time: " + data[0]["data_as_of"].substring(11, 16));
            $("#speed").text("Speed of first...Make Avg TBD: " + data[0]['speed']);

            //d3 ____________________________________________________________________
           

            //clear canvas for new data load...
            d3.select('#chartArea').selectAll('*').remove();
            //d3.select('svg').selectAll('*').remove();

            //create Boogie Woogie canvas
            const svg = d3.select("#chartArea").append("svg")
                //canvas height and width
                .attr("width", "70vh")
                .attr("height", "70vh")
                .attr("style", "outline: thin solid #adadad")
                .attr("style", "display: block");
                //.attr("viewBox", "0, 0, auto, auto");

            //
            vH_unscaled = $(window).innerHeight();
            vH = .70 * vH_unscaled
            vW_unscaled = $(window).innerWidth();
            vW = .70 * vW_unscaled
            redraw(vH, vW)

            //set rectangle sizes
            rectHeight = vH / 32;
            rectWidth = vH / 32;

            //detect if window height changes
            $(window).on('resize', function() {
                vH_unscaled = $(this).innerHeight();
                vW_unscaled = $(this).innerWidth();
                vH = .70 * vH_unscaled
                vW = .70 * vW_unscaled
                console.log("resize");
                redraw(vH, vW);
            })

            //resize canvas if window height changes
            function redraw(viewportHeight, viewportWidth) {
                svg.selectAll("*").remove();
                vH = viewportHeight;
                vW = viewportWidth;
                rectSize = Math.min(vH, vW) / 32;
                //rectHeight = vH / 32;
                //rectWidth = rectHeight;
                //change rectangle size based on new canvas size
                console.log("rectSize is now" + rectSize);
                console.log("vHeight is now" + vH);

                //tooltip
                const tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .html(d => d)
                    .html(d => {
                        let text = "<span>Borough: </span>" + d['borough'] + '<br>'
                        text += "<span>Location: </span>" + d['link_name'] + '<br>'
                        text += "<span>Speed: </span>" + d['speed']  + '<br>'
                        text += "<span>Timestamp: </span>" + d['data_as_of']
                        return text;
                    })
                svg.call(tip);

                //create grid
                rects = svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    // .attr("x", (d, i) => vH / 32 * (i % 32)) //arrays columns of rectangles (x-axis)
                    // .attr("y", (d, i) => vH / 32 * Math.floor(i / 32)) // array rows of rectangles (y-axis)
                    //vH / 32 is the size of a square
                    .attr("x", (d, i) => rectSize * (i % 32)) //arrays columns of rectangles (x-axis)
                    .attr("y", (d, i) => rectSize * Math.floor(i / 32)) // array rows of rectangles (y-axis)
                    .attr("height", rectSize) // assigns height of rectangles to predefined rectSize
                    .attr("width", rectSize) // assigns width of rectangles to predefined width
                    .attr("stroke", "#06112b") //creates a stroke around the rectangle
                    //color based on speed
                    .attr("fill", function(d) {
                        if (d['speed'] > 20) {
                            // blue
                            // return "#518cd0";
                            // return "#04bcbe";
                            return "#518cd0";
                        } else if (d['speed'] > 10) {
                            // yellow
                            // return "#ffd861";
                            return "#eceb66";
                        }
                        // red
                        return "#ff6661";
                        // return "#eb1044";
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                                
            }        
    },
    
    function writedata (){
        var t = new Date();
        var timeid = t.toISOString().replace(/:/g, "-").replace(".", "-");
        var filename = "img-"+timeid;
        //how to take the svg/xml structure and simply write it to firebase?
        var svg = document.getElementById("chartArea").getElementsByTagName("svg").item(0);
        var data = (new XMLSerializer()).serializeToString(svg);
        
        console.log(t, timeid, filename, data);
        
        db.ref('images/' + filename).set(
            {
            id: filename,
            data: data,
            timestamp: t
            }
            );
        
    }
    
    )

    
    
                                   


}


                       


function updateTime() {
    var d = new Date();
    hrT = d.getHours();
    minT = d.getMinutes();
    secT = d.getSeconds();
    $('#clock').text(d)
}

setInterval(updateTime, 1000)









//https://makitweb.com/how-to-fire-ajax-request-on-regular-interval/#:~:text=Use%20setInterval()%20when%20you,use%20the%20setTimeout()%20function.
//automate
//use express on ready if using node.js

$(document).ready(function() {
    
    //".once" method fires once at the beginning
    locRef.once("value", function (snapshot){
    /*
    //user authentication for security:
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
        var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
    });
    */
   
        var dataOnce = snapshot.val();
        
        var parser = new DOMParser();
        var svgData = parser.parseFromString(Object.values(dataOnce)[Object.keys(dataOnce).length - 1].data, "text/xml");
        //create svg element, and populate it with the svg xml from the .data branch of the item in the firebase database;
        var lastRequest = svgData.firstChild;
        lastRequest.setAttribute("width", "100%");
        lastRequest.setAttribute("height", "auto");
        //svgElement.setAttribute("viewBox", "0 0 1 1");
        document.getElementById("chartArea").appendChild(lastRequest);
        console.log(lastRequest);

        setTimeout(fetchdata, 1000);
        fetcharchive(dataOnce);
});
});
