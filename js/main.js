console.log('js Loaded');

/*
ORDER OF OPERATIONS:
    
*/

var dataOnceArray = [];
var data = [];
var speedData = [];
var FEETPERSEC_MILESPERHOUR_FACTOR = 0.681818;

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


var dataBuildings;
d3.csv("data/buildingBlock.csv", function(result){
    dataBuildings = result;
});

function Execute(){
    document.getElementById("mondrian").className = "fade_out";
    document.getElementById("chartArea").className = "fade_in";
    document.getElementById("canvasOverlay").style.display="none";

//request reference street data from endpoint  
function fetchdata() {
    console.log("getting street data using cors anywhere proxy");
    $.ajax({
        type: "GET",
        url: encodeURI('https://databoogiewoogie.herokuapp.com/https://flowmap.nyctmc.org/data/mim_polylines_info.json'),
        dataType: "json",
        contentType: "application/json",
        success: function (results) {
            console.log(" Success getting streets for " + results.RECORDS.length + "locations");
            var records = results.RECORDS;
            records.forEach(function (element) {
                data.push(element);
            });
            getStreetSpeeds();
        },
        error: function (e) {
            console.log("error loading street data " + e);
            console.log(e);
        }
    });
}

function getStreetSpeeds() {
    $.ajax({
        type: "GET",
        url: encodeURI('https://databoogiewoogie.herokuapp.com/https://flowmap.nyctmc.org/data/mim_link_data.json'),
        async: true,
        dataType: "json",
        contentType: "application/json",
        success: function (results) {
            console.log(" Success getting street speed data for " + results.RECORDS.length + "points");
            var linkData = results.RECORDS;
            data.forEach(function (poly, index) {
//                var id = poly.sid;
//                linkData[id].
                for (var i = 0; i < Math.min(data.length, linkData.length); i++) {
                    if (poly.sid == linkData[i].sid) {
                        // parseInt
                        data[i]['speed'] = ((poly.polyline_length_ft / linkData[i].medianTravelTime_seconds) * FEETPERSEC_MILESPERHOUR_FACTOR).toFixed(2);
                    }
                    else {
                    }
                }
                
            });

            if (data.length < 1024){
                var difference = 1024 - data.length;
                console.log("data is shorter. concatenating "+difference+" items from dataOnceArray.");
                dataOnceArray.reverse().slice(0,difference).forEach(function(element){
                    data.push(element);
                });
            }
            else{
                console.log("data is equal to or greater than 1024..");
            }
            
            var chartArea = document.getElementById("chartArea");
            // return data, chartArea;
            drawSVG(data, chartArea, 0.70);
            // writedata(data);
        },
        error: function (e) {
            console.log("error getting street speed data" + e);
        }
    });
}
//setTimeout(fetchdata, 1800000);
// return data, chartArea;

function writedata(data) {
    var t = new Date();
    var timeid = t.getTime();
    var timeStamp = t.toString();
    var filename = "img-" + timeid;
    //how to take the svg/xml structure and simply write it to firebase?
    //var dataSVG = (new XMLSerializer()).serializeToString(document.getElementById("chartArea").getElementsByTagName("svg").item(0));

    console.log(timeid, timeStamp, filename, data);

    db.ref('images/' + filename).set({
        id: filename,
        dataSVG: "null",
        dataJSON: data,
        time: timeStamp
    });
};


function updateTime() {
    var d = new Date();
    hrT = d.getHours();
    minT = d.getMinutes();
    secT = d.getSeconds();
    milT = d.getTime();
    $('#clock').text(d);
}


setInterval(updateTime, 1000) 

function drawSVG(data, container, scaleFactor){
            console.log(data);
            //d3 ____________________________________________________________________


            //clear canvas for new data load...
            d3.select(container).selectAll('*').remove();
    
            var widthAttribute = scaleFactor*100;
            var heightAttribute = scaleFactor*100;
            console.log(widthAttribute.toString()+"vh", heightAttribute.toString()+"vh");
            //create Boogie Woogie canvas
            const svg = d3.select(container).append("svg")
                //canvas height and width
                .attr("id", container.id+"-svg")
                //.attr('viewBox', '0 0 70 70')
                .attr("width", widthAttribute.toString()+"vh")
                .attr("height", heightAttribute.toString()+"vh")
                .attr("style", "outline: thin solid #adadad")
                .attr("style", "display: block");

            //
            vH_unscaled = $(window).innerHeight();
            vH = (scaleFactor) * vH_unscaled
            vW_unscaled = $(window).innerWidth();
            vW = (scaleFactor) * vW_unscaled
            redraw(vH, vW)

            //set rectangle sizes
            rectHeight = vH / 32;
            rectWidth = vH / 32;

            //detect if window height changes
            $(window).on('resize', function () {
                vH_unscaled = $(this).innerHeight();
                vW_unscaled = $(this).innerWidth();
                vH = scaleFactor * vH_unscaled
                vW = scaleFactor * vW_unscaled
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
                        if (d['speed'] != null){
                            // let text = "<span>Borough: </span>" + d['borough'] + '<br>'
                            // text += "<span>Location: </span>" + d['link_name'] + '<br>'
                            text = "<span>Speed: </span>" + d['speed'] + "<span> mph</span>"
                            // , text += "x= "+d.x+" y= "+d.y
                            // text += "<span>Timestamp: </span>" + d['data_as_of']
                            return text;    
                            } 
                            else {
                            text = "No data"
                            return text;    
                            }
                        
                        
                    })
                svg.call(tip);

                //streets
                streets = svg.append("g")
                        .attr("class", "streets");

                streets.selectAll("rect")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "streets")
                    .attr("x", (d, i) => vH / 32 * (i % 32)) //arrays columns of rectangles (x-axis)
                    .attr("y", (d, i) => vH / 32 * Math.floor(i / 32)) // array rows of rectangles (y-axis)
                    .attr("height", vH / 32) // assigns height of rectangles to predefined height
                    .attr("width", vH / 32) // assigns width of rectangles to predefined width
                    .attr("stroke", "#f3f3f3") //creates a stroke around the rectangle
                    //color based on speed
                    .attr("fill", function (d) {
                        if (d['speed'] > 20) {
                            // blue
                            // return "#518cd0";
                            // return "#04bcbe";
                            return "#006ae3";
                        } else if (d['speed'] > 10) {
                            // yellow
                            // return "#ffd861";
                            return "#ffdb00";
                        } else if (d['speed'] < 10) {
                        // red
                        return "#e30000";
                        // return "#eb1044";
                        } else {
                        return "#cbcbcb";
                        }
                            
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)

                // $.getJSON("https://cors-anywhere.herokuapp.com/json/building.json", function(json) {
                // console.log(json)
                // data3 = json
                // create building grid

                
                // https://stackoverflow.com/questions/18151455/d3-js-create-objects-on-top-of-each-other/18461464
                dataBuildings.x = parseInt(dataBuildings.x);
                dataBuildings.y = parseInt(dataBuildings.y);
                
                buildings = svg.append("g")
                    .attr("class", "buildings");
                buildings.selectAll("rect")
                    .data(dataBuildings)
                    .enter().append("rect")
                    //create a group for buildings
                    .attr("class", "buildings")
                    .attr("x", function (d) {
                        return d.x / 32 * vH;
                    })
                    .attr("y", function (d) {
                        return d.y / 32 * vH;
                    })
                    .attr("height", vH / 32) // assigns height to predefined height
                    .attr("width", vH / 32) // assigns width to predefined width
                    .attr("stroke", "#f3f3f3")
                    .attr("fill", "#f3f3f3")
                
            }
    return(console.log(vH, rectSize));

}

//https://makitweb.com/how-to-fire-ajax-request-on-regular-interval/#:~:text=Use%20setInterval()%20when%20you,use%20the%20setTimeout()%20function.
//automate
//use express on ready if using node.js


$(document).ready(function(){

    console.log("document ready!");
    //before starting the fetchdata function, need to immediately read from archive and put the previous-requested svg on the canvas
    //".once" method fires once at the beginning
    locRef.once("value", function (snapshot) {

        /*
        //user authentication for security:
        var userId = firebase.auth().currentUser.uid;
        return firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
            var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
        // ...
        });
        */

        $("#loaderGif").show();

        document.getElementById("mondrian").style.display = "none";
        var chartArea = document.getElementById("chartArea");
        var dataOnce = snapshot.val();

        //the JSONData variable is the JSON format of the last request. Can use that to draw a canvas while you wait for the next request to come in.
        var dataJSONLast = Object.values(dataOnce)[Object.keys(dataOnce).length - 1].dataJSON;

        // checking time since last request and proceeding or not proceeding with a new request if it's been more than 30 miutes:
        var timeLast = parseInt(Object.keys(dataOnce)[Object.keys(dataOnce).length - 1].substr(4));
        var timeNow = new Date().getTime();
        var timeDiff = Math.abs(timeNow - timeLast);

        if (timeDiff < 1800000) {
            //time difference is less than 30 min, do nothing but set timer for remainder of time before running fetchdata function
            console.log("No new request made since " + timeDiff + "milliseconds / " + timeDiff / 60000 + "mins since last request");
            setTimeout(fetchdata, timeDiff);
        } else {
            //time difference is greater than 30 min, run fetchdata function
            console.log("Request made since " + timeDiff + "milliseconds / " + timeDiff / 60000 + "mins since last request");
            fetchdata();
        }

        //draw the most recent chart..This should also grab the buildings data (but something needs to change for that to happen, apparently..).
        drawSVG(dataJSONLast, chartArea, 0.70);
                  
        //display retrieved data sample in the browser
        $("#date").text("Last updated day: " + dataJSONLast[0]["data_as_of"].substring(0, 10));
        $("#time").text("Last updated time: " + dataJSONLast[0]["data_as_of"].substring(11, 16));
        $("#speed").text("Speed of first...Make Avg TBD: " + dataJSONLast[0]['speed']);
        
        $("#loaderGif").hide();

        //to populate the archive images, iterate over each past data entry
        Object.keys(dataOnce).forEach(function (key) {
            var archiveElement = document.createElement("div");
            archiveElement.id = dataOnce[key].id;

            archiveElement.className = "archivedCanvas";


            //archiveTitle contains the title text of the svg:
            var titleElement = document.createElement("p");
            var archiveTitle = document.createTextNode(dataOnce[key].time.substr(0, 24) + ":");
            titleElement.appendChild(archiveTitle);

            //archiveCanvas contains the svg:
            var archiveCanvas = document.createElement("div");
            archiveCanvas.id = dataOnce[key].time;
            archiveElement.className = "archiveCanvas";
            var dataJSON = dataOnce[key].dataJSON;
            drawSVG(dataJSON, archiveCanvas, .25);

            //push both svg and title into the archiveElement, then push that into the Archived Canvases container:
            archiveElement.appendChild(titleElement);
            archiveElement.appendChild(archiveCanvas);
            document.getElementById("archive").appendChild(archiveElement);
            
            dataJSON.forEach(function(element){
                if (dataOnceArray.length < 1024){
                    dataOnceArray.push(element); 
                }
                else {return};
            });
        });
        
        return console.log(dataOnceArray);

    });
});
    
}
