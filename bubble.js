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
var data = dataBubble["01 - Animal products"];

window.onload = drawBubble(data);




// Bubble Chart
function drawBubble(data) {
  
  //convert numerical values from strings to numbers, rename variables
  data = data.map(function(d){ d.value = +d['Imports_Product']; return d; });
  data = data.map(function(d){ d.tariff = +d['Avg_Product_Tariffs']; return d});
  data = data.map(function(d){ d.id = d['ISO-3A']; return d});
  data = data.map(function(d){ d.name = d['Country']; return d});
  data = data.map(function(d){ d.region = d['Region']; return d});
  //Get the max and min import value
  var maxValue = d3.max(data, function(d) { return d.value; });
  var minValue = d3.min(data, function(d) { return d.value; });
  //Get the max tariff value
  var maxTariff = d3.max(data, function(d) { return d.tariff; });
  // Format imports
  var formatNumber = d3.format(",.4f"),
    format = function(d) { return formatNumber(d); };
    
  //Svg
  var divBubble1 = d3.select('#bubbleInteractive').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  var rescale = 0.90, 
    height = 600 * rescale,
    width = 900 * rescale,
    color = d3.scaleLinear()
    .domain([0, 5, 10, 15, 20, 25, 30])
    //viridis
    //.range(["#FDE725", "#8FD744", "#35B779", "#21908C", "#31688E", "#443A83", "#440154"]);
    //plasma
    .range(["#F0F921", "#FEBC2A", "#F48849", "#DB5C68", "#B93289", "#8B0AA5", "#5402A3"]);
    //magma
    //.range(["#FCFDBF", "#FEBA80", "#F8765C", "#D3436E", "#982D80", "#5F187F", "#23115F"]);
    //inferno
    //.range(["#FCFFA4", "#FAC127", "#F57D15", "#D44842", "#9F2A63", "#65156E", "#280B54"]);
    
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
    .style("fill", "transparent");
  
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
    divBubble1.transition()        
    .duration(0)      
    .style('opacity', 1);      
    divBubble1.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + d.region  + '<br/>' +'Imports: ' + format(d.value) + ' Bn US$' +'<br/>'+ 'Average applied tariffs: ' + d.tariff + '%')
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
    divBubble1.transition()        
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
  var legendTitleText = ['Color: Average applied tariffs in % - Size: Amount of imports in billion US$ - Click the background to show labels'];
  var legend = svg.selectAll('.legend')
  .data(color.domain())
  .enter().append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) { return 'translate(' + i * 27 + ', 0)'; });
  
  legend.append('rect')
  .attr('y', height - 38)
  .attr('width', 27)
  .attr('height', 18)
  .style('fill', color);
  
  legend.append('text')
  .attr('y', height - 46)
  .attr('x', 18)
  .attr('dy', '.35em')
  .style('text-anchor', 'end')
  .text(function(d) { return d; });
  
  legend.append('text')
  .data(legendTitleText)
  .attr('y', height - 10)
  .attr('x', 0)
  .attr('dy', '.35em')
  .text(function(d) {
    return d;
  });
    
}





//Update data section (called from the onchange)
function updateData() {
  var newArray = d3.select("#opts").node().value;
  var data = dataBubble[newArray];
  d3.select("#bubbleInteractiveSvg").remove();
  drawBubble(data);
}

d3.select('#opts')
  .on('change', updateData);  
  
  
  
  
  
  
  
  
  