console.log('js Loaded');

// var domtoimage = require('dom-to-image');

// const express = require('express');
// const app = express();
// app.listen(3000,() => console.log('listening at 3000'));
// app.use(express.static('../'));

//needed to do npm install.....
//npm install jquery --save
// var $ = require("jquery");

// request from API

function fetchdata() {

    $.ajax({
        // url: "https://data.cityofnewyork.us/resource/i4gi-tjb9.json?borough=Manhattan",
        url: "https://data.cityofnewyork.us/resource/i4gi-tjb9.json?",
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
            // setTimeout(fetchdata, 15000);

            //https://stackoverflow.com/questions/36941042/convert-div-into-downloadable-image/47917770
            // var node = document.getElementById('chartArea');
            // node.innerHTML = "I'm an image now."
            // domtoimage.toBlob(document.getElementById('chartArea'))
            //   .then(function(blob) {
            //     window.saveAs(blob, 'chartArea.png');
            //   });

        }
    }).done(function(data) {
            alert("Retrieved " + data.length + " records from the dataset!");
            console.log(data);
            // screenshot of website
            // const fs = require('fs');
            // const fetch = require('node-fetch');

            // const url = "https://www.something.com/.../image.jpg"

            // async function download() {
            //   const response = await fetch(url);
            //   const buffer = await response.buffer();
            //   fs.writeFile(`./image.jpg`, buffer, () => 
            //     console.log('finished downloading!'));
            // }

            // var dictstring = JSON.stringify(data);

            //save json of last call
            // var fs = require('fs');
            // fs.writeFile("lastRequest.json", dictstring, function(err, result) {
            // if(err) console.log('error', err);
            //  });


            //display retrieved data sample in the browser
            $("#date").text("Last updated day: " + data[0]["data_as_of"].substring(0, 10));
            $("#time").text("Last updated time: " + data[0]["data_as_of"].substring(11, 16));
            $("#speed").text("Speed of first...Make Avg TBD: " + data[0]['speed']);

            // $('body').css('color', 'yellow')
            // speed1 = data[0]['speed']
            //debug check: change the browser css based on retrieved data
            // if (speed1 > 10) {
            //   $('body').css('color', 'blue')
            // }
            //_______________________________________________________________________________
            //d3

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
                        let text = "<span>Borough: </span>" + d['borough'] + ',     '
                        text += "<span>Location: </span>" + d['link_name'] + ',     '
                        text += "<span>Speed: </span>" + d['speed']
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
                    .attr("x", (d, i) => vH / 32 * (i % 32)) //arrays columns of rectangles (x-axis)
                    .attr("y", (d, i) => vH / 32 * Math.floor(i / 32)) // array rows of rectangles (y-axis)
                    .attr("height", vH / 32) // assigns height of rectangles to predefined height
                    .attr("width", vH / 32) // assigns width of rectangles to predefined width
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
        }
        // cache data from api

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
$(document).ready(function() {
    setTimeout(fetchdata, 400);
});