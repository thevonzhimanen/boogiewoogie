console.log('js Loaded');


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
    url: "https://data.cityofnewyork.us/resource/i4gi-tjb9.json?borough=Manhattan",
    type: "GET",
    data: {
      "$limit": 1024,
      "$$app_token": "ReXNLc0gRAMKhmOChFYGqCdlk"
    },
    beforeSend: function(){
      // Show image container
      // $("#loaderGif").css("display:block !important");
      $("#loaderGif").show();
     },
    //automated requests every half hour
    complete: function (data) {
      setTimeout(fetchdata, 1800000);
      $("#loaderGif").hide();
      // setTimeout(fetchdata, 15000);
    }
  }).done(function (data) {
    alert("Retrieved " + data.length + " records from the dataset!");


    var dictstring = JSON.stringify(data);

    //save json of last call
    // var fs = require('fs');
    // fs.writeFile("lastRequest.json", dictstring, function(err, result) {
    // if(err) console.log('error', err);
    //  });


    console.log(data);

    //display retrieved data sample in the browser
    $("#date").text("Last updated day: " + data[0]["data_as_of"].substring(0, 10));
    $("#time").text("Last updated time: " + data[0]["data_as_of"].substring(11, 16));
    $("#speed").text("Speed of first...Make Avg TBD:" + data[0]['speed']);

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
      // .attr("width", "70vh")
      .attr("width", "70vh")
      .attr("height", "70%")
      // .attr("height", "100%")
      .attr("style", "outline: thin solid #adadad")
      .attr("style","display: block" );


    //
    vH_unscaled = $(window).innerHeight();
    vH = .70 * vH_unscaled
    vW_unscaled = $(window).innerWidth();
    vW = vW_unscaled
    redraw(vH,vW)

    //set rectangle sizes
    rectHeight = vH / 32;
    rectWidth = vH / 32;

    //detect if window height changes
    $(window).on('resize', function () {
      vH_unscaled = $(this).innerHeight();
      vW_unscaled = $(this).innerWidth();
      vH = .70 * vH_unscaled
      vW = vW_unscaled
      console.log("resize");
      redraw(vH,vW);
    })

    //resize canvas if window height changes
    function redraw(viewportHeight,viewportWidth) {
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
          let text = "<span>Borough: </span>" + d['borough'] + ',  '
          text += "<span>Location: </span>" + d['link_name'] + ',  '
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
        .attr("x", (d, i) => vH / 32 * (i % 32 )) //arrays columns of rectangles (x-axis)
        .attr("y", (d, i) => vH / 32 * Math.floor(i / 32)) // array rows of rectangles (y-axis)
        .attr("height", vH / 32) // assigns height to predefined height
        .attr("width", vH / 32) // assigns width to predefined width
        .attr("stroke", "white") //creates a stroke around the rectangle
        //color based on speed
        .attr("fill", function (d) {
          if (d['speed'] > 20) {
            return "blue";
          } else if (d['speed'] > 10) {
            return "yellow";
          }
          return "red";
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
    }
  }
    // cache data from api

  )
};

//https://makitweb.com/how-to-fire-ajax-request-on-regular-interval/#:~:text=Use%20setInterval()%20when%20you,use%20the%20setTimeout()%20function.
//automate
$(document).ready(function () {
  setTimeout(fetchdata,400);
});