//
//  Bubble Interactive Chart
//
// Marc Gumowski
//
//
// .range([4,80]) -> forces (0.08), alpha(0.3)

// The data are loaded in the main .Rmd file under the var name data.
// This script has to be loaded in the main file.



// Initial Data
var data = dataBubble["00 - Total"];

window.onload = drawBubble(data);




// Bubble Chart
function drawBubble(data) {
  
  //convert numerical values from strings to numbers, rename variables
  data = data.map(function(d){ d.value = +d.Imports_Product; return d; });
  data = data.map(function(d){ d.tariff = +d.Avg_Product_Tariffs; return d});
  data = data.map(function(d){ d.id = d['ISO-3A']; return d});
  data = data.map(function(d){ d.name = d.Country; return d});
  data = data.map(function(d){ d.region = d.Region; return d});
  //Get the max and min import value
  var maxValue = d3.max(data, function(d) { return d.value; });
  var minValue = d3.min(data, function(d) { return d.value; });
  //Get the max tariff value
  var maxTariff = d3.max(data, function(d) { return d.tariff; });
  // Format imports
  var formatNumber = d3.format(".4f"),
    format = function(d) { return formatNumber(d); };
  
  var rescale = 1.25, 
    height = 480 * rescale,
    width = 960 * rescale,
    color = d3.scaleThreshold()
    .domain([0, 2, 4, 6, 8, 10, 15, 20])
    // plasma
    //.range(["#F0F921", "#FDC328", "#F89441", "#E56B5D", "#CC4678", "#A92395", "#7E03A8", "#4C02A1", "#0D0887"]);
    // viridis
    .range(["#440154", "#472D7B", "#3B528B", "#2C728E", "#21908C", "#27AD81", "#5DC863", "#AADC32", "#FDE725"]);    
    // magma
    //.range(["#000004", "#1D1147", "#51127C", "#822681", "#B63679", "#E65164", "#FB8861", "#FEC287", "#FCFDBF"]); 
    // inferno
    //.range(["#000004", "#210C4A", "#56106E", "#89226A", "#BB3754", "#E35932", "#F98C0A", "#F9C932", "#FCFFA4"]); 
  
  // Div
  var div = d3.select('#bubbleInteractive').append('div')
    .attr('class', 'tooltip')
    .attr('id', 'bubbleInteractiveDiv')
    .style("fill", "transparent")
    .style('opacity', 0);  
   
  // Svg  
  var svg = d3.select('#bubbleInteractive')
    .append('svg')
    .attr('id', 'bubbleInteractiveSvg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)');
  
  // Rect to click on (background)
  var rect = svg.append("rect")
    .attr("height", height)
    .attr("width", width)
    .style("fill", "transparent")
    .style('opacity', 0);
    
  var radiusScale = d3.scaleSqrt()
    .domain([minValue, maxValue])
    .range([2, 40]);
  
  // Forces
  
  // Constants used in the simulation
  var strengthCombine = 0.1;
  var strengthMove = 0.2;
  var strengthCharge = -2;
  var strengthCollide = 0.5;
  
  var forceXCombine =  d3.forceX(width / 2)
    .strength(strengthCombine);
  var forceYCombine =  d3.forceY(height / 2)
    .strength(strengthCombine);
  
  var forceXOrderImports =  d3.forceX(function(d) {return (Math.log(d.value + 1.3) / Math.log(maxValue + 1.3) * 0.83 * width) + 30;})
    .strength(strengthMove);
  
  var forceXOrderTariffs =  d3.forceX(function(d) {return (Math.log(d.tariff + 1.3) / Math.log(maxTariff + 1.3) * 0.83 * width) + 30;})
    .strength(strengthMove);
    
  var forceXSeparate =  d3.forceX(function(d) {
    if(d.region === 'North America') {
      return 175 * rescale;
    } else if(d.region === 'South and Central America and the Caribbean') {
      return 200 * rescale;
    } else if(d.region === 'Europe') {
      return 450 * rescale;
    } else if(d.region === 'Africa') {
      return 450 * rescale;
    } else if(d.region === 'Commonwealth of Independent States (CIS)') {
      return 600 * rescale;
    } else if(d.region === 'Middle East') {
      return 550 * rescale;
    } else if(d.region === 'Asia') {
      return 750 * rescale;
    } else {
      return width / 2;
    }
  }).strength(strengthMove);
  
  var forceYSeparate =  d3.forceY(function(d) {
    if(d.region === 'North America') {
      return 200 * rescale;
    } else if(d.region === 'South and Central America and the Caribbean') {
      return 400 * rescale;
    } else if(d.region === 'Europe') {
      return 150 * rescale;
    } else if(d.region === 'Africa') {
      return 350 * rescale;
    } else if(d.region === 'Commonwealth of Independent States (CIS)') {
      return 125 * rescale;
    } else if(d.region === 'Middle East') {
      return 245 * rescale;
    } else if(d.region === 'Asia') {
      return 250 * rescale;
    } else {
      return height/ 2;
    }
  }).strength(strengthMove);
  
  var forceCharge = d3.forceManyBody()
      .strength(strengthCharge);
      
  var forceCollide = d3.forceCollide()
        .strength(strengthCollide)
        .radius(function(d) {
    return radiusScale(d.value) + 2;
  });    
      
  var simulation = d3.forceSimulation()
      .force('x', forceXCombine)
      .force('y', forceYCombine)
      .force('charge', forceCharge)
      .force('collide', forceCollide);
  
  var circles = svg.selectAll('.countryBubble')
      .data(data)
      .enter().append("g");
  
  // Bubbles
  circles.append('circle')
    .attr('class', 'countryBubble')
    .attr('r', function(d){
    return radiusScale(d.value);
  })
  .on('click', function(d) {
    console.log(d);
  })
  .style('fill', function(d) { return color(d.tariff); 
  })
  .on('mouseover', function(d) {      
    div.transition()        
    .duration(0)      
    .style('opacity', 1);      
    div.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + d.region  + '<br/>' +'Imports: $' + format(d.value) + ' bn' +'<br/>'+ 'Average applied tariffs: ' + d.tariff + '%')
    .style('left', (d3.event.pageX) + 'px')       //Tooltip positioning, edit CSS
    .style('top', (d3.event.pageY - 28) + 'px');  //Tooltip positioning, edit CSS
    d3.select(this)
    .transition()
    .duration(0)
    .style('stroke-width', 1)
    .style('stroke', color(d.tariff))
    .style('fill-opacity', 0.5);
  })
  .on('mouseout', function(d) {       
    div.transition()        
    .duration(500)      
    .style('opacity', 0);
    d3.select(this)
    .transition()
    .duration(0)
    .style('stroke-width', 'none')
    .style('stroke', 'none')
    .style('fill-opacity', 1);
  });
  
  
  var newFont = '0px sans-serif';
  //Bubbles Text on click
  circles.append("text")
    .attr('class', 'countryText')
    .text(function(d) {
       var text = d.id;
        return text;
    })
    .style('fill', '#666666')
    .style('font', '0px sans-serif')
    .style('font-family', 'calibri')
    .style('text-anchor', 'middle');
  
    rect.on("click", function() {
    	  if (newFont === '0px sans-serif') {
    	    newFont = function(d) { 
    	      var len = d.id.length;
    	      var size = radiusScale(d.value) / 5;
    	      size *= 10 / len;
    	      size += 1;
    	      return Math.round(size)+'px sans-serif';
    	    };
    	  } else { newFont = '0px sans-serif';}
    	  d3.selectAll(".countryText")
    	    .style('font', newFont)
    	    .attr("dy", '.35em');
  });
  
  
  
  // Buttons
  d3.select('#region')
    .on('click', function(d){
      simulation
        .force('x', forceXSeparate)
        .force('y', forceYSeparate)
        .alpha(0.3)
        .restart();      
    });
  
    d3.select('#combine')
    .on('click', function(d){
      simulation
        .force('x', forceXCombine)
        .force('y', forceYCombine)
        .alpha(0.3)
        .restart();
    });
    
        d3.select('#orderImports')
    .on('click', function(d){
      simulation
        .force('x', forceXOrderImports)
        .force('y', forceYCombine)
        .alpha(0.3)
        .restart();
    });
    
        d3.select('#orderTariffs')
    .on('click', function(d){
      simulation
        .force('x', forceXOrderTariffs)
        .force('y', forceYCombine)
        .alpha(0.3)
        .restart();
    });    
  
  // Simulation
  simulation.nodes(data)
  .on('tick', ticked);
  
  function ticked() {
    circles
    .attr("transform", function (d) {
        var k = "translate(" + d.x + "," + d.y + ")";
        return k;
    });
  }
  
  
  //Legend 
  var legendTitleText = ['Color: Average applied tariffs in % - Size: Amount of imports in US$ billion - Click the background to show   labels'];
  var legendRectText = [" 0<2 ", " 2<4 ", " 4<6 ", " 6<8 ", " 8<10", "10<15", "15<20", " 20< "];
  
  var legendBubble = svg.append('g')
    .attr('class', 'legendBubble')
    .selectAll('g')
    .data(color.domain())
    .enter().append('g')
    .attr('transform', function(d, i) { return 'translate(' + i * 36 + ', 0)'; });
    
  var legendBubbleSize = svg.append('g')
    .attr('class', 'legend')
    .selectAll('g')
    .data([d3.format(".1r")(maxValue), d3.format(".1r")(maxValue) / 2, d3.format(".1r")(d3.format(".1r")(maxValue) / 10)])
    .enter().append('g');
  
  legendBubble.append('rect')
    .attr('y', height - 38)
    .attr('x', 100)
    .attr('width', 36)
    .attr('height', 10)
    .style('fill', color);
  
  legendBubble.append('text')
    .data(legendRectText)
    .attr('y', height - 46)
    .attr('x', 118)
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('fill', '#666666')
    .style('font', '10px sans-serif')
    .style('font-family', 'calibri')
    .text(function(d) { return d; });
  
  legendBubble.append('text')
    .data(legendTitleText)
    .attr('y', height - 10)
    .attr('x', 100)
    .attr('dy', '.35em')
    .style('fill', '#666666')
    .style('font', '14px sans-serif')
    .style('font-family', 'calibri')
    .text(function(d) { return d; });

  legendBubbleSize.append('circle')
    .attr("transform", "translate(" + 50 + "," + (height - 1) + ")")
    .attr("cy", function(d) { return -radiusScale(d); })
    .attr("r", radiusScale)
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-width", "1.5px");

  legendBubbleSize.append("text")
    .attr("transform", "translate(" + 50 + "," + height + ")")
    .attr("y", function(d) { return -2.2 * radiusScale(d) + 3; })
    .attr("dy", "1.3em")
    .text(function(d) { return d; })
    .style("fill", "#666666")
    .style("font-family", "calibri")
    .style("font", "10px sans-serif")
    .style("text-anchor", "middle");
    
}





//Update data section (called from the onchange)
function updateData() {
  var newArray = d3.select("#opts").node().value;
  var data = dataBubble[newArray];
  d3.select("#bubbleInteractiveSvg").remove();
  d3.select("#bubbleInteractiveDiv").remove();
  drawBubble(data);
}

d3.select('#opts')
  .on('change', updateData);  
  
  
  
  
  
  
  
  
  