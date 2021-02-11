console.log('js Loaded 2');

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

window.db = firebase.database();
window.locRef = db.ref("images");

//before starting the fetchdata function, need to immediately read from archive and put the previous-requested svg on the canvas
locRef.once("value", function fetcharchive(snapshot) {

    /*
    //user authentication for security:
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
        var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
    });
    */

    var dataOn = snapshot.val()

    //document.getElementById("chartArea").innerHTML=dataOn;

    //to populate the archive images, iterate over each past data entry
    Object.keys(dataOn).forEach(function (key) {
        console.log("Firebase snapshot: ", key, dataOn[key]);
        //use dataOn[key].data to get the base64 version of each svg;
        var parser = new DOMParser();
        var doc = parser.parseFromString(dataOn[key].data, "text/xml");

        // var css = 'svgElement:hover{ background-color: #00ff00 }';

        var svgElement = document.createElement("svg");

        svgElement.setAttribute('viewBox', '0 0 50 100');
        svgElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        svgElement.setAttribute('width', '10px');
        svgElement.setAttribute('height', '10px');

        svgElement.id = key;
        svgElement.className = "archive";
        svgElement.innerHTML = dataOn[key].data;
        svgElement

        document.getElementById("archive").appendChild(svgElement);

    });
});

//request data from API    
function fetchdata() {

    $.ajax({
        url: encodeURI("https://data.cityofnewyork.us/resource/i4gi-tjb9.json?$order=data_as_of DESC&borough=Manhattan"),

        type: "GET",
        data: {
            "$limit": 1024,
            "$$app_token": "ReXNLc0gRAMKhmOChFYGqCdlk"
        },
        beforeSend: function () {
            // Show image container

            $("#loaderGif").show();
        },
        //automated requests every half hour
        complete: function (data) {
            setTimeout(fetchdata, 1800000);

            //Hide loading gif after data is received. Need to update gif
            $("#loaderGif").hide();
        }

    }).done(function (data) {
            alert("Retrieved " + data.length + " records from the dataset!");
            console.log(data);

            //display retrieved data sample in the browser
            $("#date").text("Last updated day: " + data[0]["data_as_of"].substring(0, 10));
            $("#time").text("Last updated time: " + data[0]["data_as_of"].substring(11, 16));
            $("#speed").text("Speed of first...Make Avg TBD: " + data[0]['speed']);

            //d3 ____________________________________________________________________


            //clear canvas for new data load...
            d3.select('#chartArea').selectAll('*').remove();
            d3.select('svg').selectAll('*').remove();

            //create Boogie Woogie canvas
            const svg = d3.select("#chartArea").append("svg")
                //canvas height and width
                .attr("width", "70vh")
                .attr("height", "70vh")
                .attr("style", "outline: thin solid #adadad")
                .attr("style", "display: block");

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
            $(window).on('resize', function () {
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

                rectHeight = vH / 32;
                rectWidth = rectHeight;
                //change rectangle size based on new canvas size
                console.log("rectHeight is now" + rectHeight);
                console.log("vHeight is now" + vH);

                //tooltip
                const tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .html(d => d)
                    .html(d => {
                        // let text = "<span>Borough: </span>" + d['borough'] + '<br>'
                        // text += "<span>Location: </span>" + d['link_name'] + '<br>'
                        text = "<span>Speed: </span>" + d['speed'] + "<span> mph</span>"
                        // , text += "x= "+d.x+" y= "+d.y
                        // text += "<span>Timestamp: </span>" + d['data_as_of']
                        return text;
                    })
                svg.call(tip);

                //create grid
                rects = svg.selectAll("rect.streets")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("class", "streets")
                    .attr("x", (d, i) => vH / 32 * (i % 32)) //arrays columns of rectangles (x-axis)
                    .attr("y", (d, i) => vH / 32 * Math.floor(i / 32)) // array rows of rectangles (y-axis)
                    .attr("height", vH / 32) // assigns height of rectangles to predefined height
                    .attr("width", vH / 32) // assigns width of rectangles to predefined width
                    .attr("stroke", "#06112b") //creates a stroke around the rectangle
                    //color based on speed
                    .attr("fill", function (d) {
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

                // $.getJSON("https://cors-anywhere.herokuapp.com/json/building.json", function(json) {
                // console.log(json)
                // data3 = json
                d3.csv("data/buildingBlock.csv", function (data) {
                    // https://stackoverflow.com/questions/18151455/d3-js-create-objects-on-top-of-each-other/18461464

                    data.x = parseInt(data.x);
                    data.y = parseInt(data.y);

                    console.log(data)
                    rects = svg.selectAll("rect.buildings")
                        .data(data)
                        .enter().append("rect")
                        .attr("class", "buildings")
                        .attr("x", function (d) {
                            return d.x / 32 * vH;
                        })
                        .attr("y", function (d) {
                            return d.y / 32 * vH;
                        })
                        .attr("height", vH / 32) // assigns height to predefined height
                        .attr("width", vH / 32) // assigns width to predefined width
                        .attr("stroke", "#06112b")
                        .attr("fill", "#06112b")
                        // .on('mouseover', tip.show)
                        // .on('mouseout', tip.hide)
                    // .attr("fill-opacity","0.6")

                });

            }
        },















        // cache data from api:

        //take rects svg and store it as variable; name it 'svg' plus the date for a unique name
        //save svg to firebase
        //script for populating the Archive Gallery with all past svgs

        function writedata() {
            var t = new Date();
            var timeid = t.getTime();
            var filename = "svg-" + timeid;
            //how to take the svg/xml structure and simply write it to firebase?
            var svg = document.getElementById("chartArea").getElementsByTagName("svg").item(0);
            var data = (new XMLSerializer()).serializeToString(svg);

            console.log(t, timeid, filename, data);

            db.ref('images/' + filename).set({
                id: filename,
                data: data
            });

            /*
            //THIS IS FOR FIREBASE STORAGE, NOT REALTIME DATABASE:
            //create Firebase Storage reference:
            var storage = firebase.storage();
            var storageRef = storage.ref();
            var imagesRef = storageRef.child('images');

            //create unique file name with timestamp:
            var t = new Date();
            var timeid = t.getTime();
            var filename = "svg-"+"timeid";
            var svgref = imagesRef.child('filename');
            console.log(svgref.fullPath)
            */

        }

    )




};

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
$(document).ready(function () {
    setTimeout(fetchdata, 400);
});