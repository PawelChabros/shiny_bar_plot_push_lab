// !preview r2d3 data=data

function setup() {
  
  let margin = {
    left: 50,
    bottom: 120,
    top: 50,
    right: 20
  };
  
  let plotWidth = width - margin.left - margin.right,
      plotHeight = height - margin.top - margin.bottom;
      
  let plot = svg.append('g')
    .attr('class', 'plot')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
      
  return {margin, plotWidth, plotHeight, plot};
  
}
function nChar(n) {
  return n.toString().length;  
}
function scales() {

  let xDomain = [...new Set(data.map(d => d.Rok))],
      cDomain = [...new Set(data.map(d => d.label))],
      yearSum = d3.nest()
        .key(function(d) {return d.Rok})
        .rollup(function(d) {
          return d3.sum(d, function(g) {return g.n})
        })
        .entries(data),
      maxVal = d3.max(yearSum, d => d.value);
  
  let yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([plotHeight, 0])
        .nice(),
      xScale = d3.scaleBand()
        .domain(xDomain)
        .range([0, plotWidth])
        .padding(0.2),
      cScale = d3.scaleOrdinal()
        .domain(cDomain)
        .range([
          'rgb(67, 67, 72)',
          'rgb(124, 181, 236)',
          'rgb(144, 237, 125)'
        ]);
        
    return {xScale, yScale, cScale, maxVal, xDomain, cDomain, yearSum, maxVal};

}
function axes() {
  
  let xAxis = d3.axisBottom(xScale)
        .tickSizeOuter(0),
      yAxis = d3.axisLeft(yScale);
  
  return {xAxis, yAxis};
}
function grid() {
  
  let gridlines = d3.axisRight()
    .tickFormat('')
    .tickSize(plotWidth)
    .scale(yScale)

  return gridlines;
  
}
function stackCalc(data) {

  let newData = [],
      types = [...new Set(data.map(d => d.typ))],
      x0;
  
  data.forEach((d, i, a) => {
    
    let cRok = d.Rok
        cTyp = d.typ; 
    
    if (d.typ == types[0]) {
      x0 = 0;
    } else {
      let fRow = newData.filter(function(d) {
        return d.Rok == cRok & d.typ == types[types.indexOf(cTyp) - 1]
      })[0]
      x0 = fRow.n + fRow.x0;
    }
    
    newData.push({
      Rok: d.Rok,
      typ: d.typ,
      n: d.n,
      x0: x0
    })
  });
  
  return newData;

}
function drawBars() {
  
  plot.selectAll('rect')
    .data(stackCalc(data))
    .enter()
    .append('rect')
      .attr('class', 'plot')
      .attr('x', d => xScale(d.Rok))
      .attr('y', d => yScale(d.x0 + d.n))
      .attr('width', xScale.bandwidth())
      .attr('height', d => plotHeight - yScale(d.n))
      .attr('fill', d => cScale(d.typ));
  
}
function drawAxes() {
  
  plot.append('g')
    .attr('class', 'xAxis axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(xAxis);
    
  plot.append('text')
    .attr('transform', `translate(${plotWidth / 2}, ${plotHeight + 43})`)
    .style('text-anchor', 'middle')
    .text('rok');
    
  plot.append('g')
    .attr('class', 'yAxis axis')
    .call(yAxis);

}
function drawLabels() {
  
  let size = 15;
  
//  dropShadow();
  
  function nChar(n) {
    return n.toString().length;  
  }
  
  plot.selectAll('label')
    .data(stackCalc(data))
    .enter()
    .append('rect')
      .attr('class', 'label')
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2 - (nChar(d.n) + 1) * 4)
      .attr('y', d => yScale(d.x0 + d.n / 2) - size / 1.666)
      .attr('width', d => (nChar(d.n) + 1) * 8)
      .attr('height', size)
      .attr('fill', d => cScale(d.typ))
//      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

  plot.selectAll('label')
    .data(stackCalc(data))
    .enter()
    .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.x0 + d.n / 2))
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.n);

}
function drawLabelsSum() {

  let size = 15;
  
//  dropShadow();
  
  function nChar(n) {
    return n.toString().length;  
  }
  
  plot.selectAll('labelSum')
    .data(yearSum)
    .enter()
    .append('rect')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2 - (nChar(d.value) + 1) * 4)
      .attr('y', d => yScale(d.value + maxVal * 0.1) - size / 1.666)
      .attr('width', d => (nChar(d.value) + 1) * 8)
      .attr('height', size)
//      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

  plot.selectAll('labelSum')
    .data(yearSum)
    .enter()
    .append('text')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value + maxVal * 0.1))
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.value);
  
}
function dropShadow() {
  
  let defs = plot.append('defs');
  let filter = defs.append('filter')
    .attr('id', 'drop-shadow')
    .attr('height', '130%');
    
  filter.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 10)
    .attr('result', 'blur');
  
  filter.append('feOffset')
    .attr('in', 'blur')
    .attr('dx', 5)
    .attr('dy', 5)
    .attr('result', 'offsetBlur');
  
  var feMerge = filter.append('feMerge');

  feMerge.append('feMergeNode')
    .attr('in', 'offsetBlur')
  feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');
  
}
function drawGrid() {

  plot.append('g')
     .attr('class', 'grid')
     .call(gridlines);
     
}
function drawLegend() {
  
  let len = cDomain.length;
  let legend = cDomain.map((d, i) => ({
    lab: d,
    x: ((i + 1)/ (len + 1)) * plotWidth,
    y: 300,
    fill: cScale(d)
  }));
  
  plot.selectAll('legend')
  .data(legend)
  .enter()
  .append('circle')
    .attr('r', 8)
    .attr('cx', d => d.x - nChar(d.lab) * 2.5)
    .attr('cy', d => d.y)
    .attr('fill', d => d.fill);

plot.selectAll('legend')
  .data(legend)
  .enter()
  .append('text')
    .attr('x', d => d.x + 12)
    .attr('y', d => d.y)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .text(d => d.lab);
  
}

let {margin, plotWidth, plotHeight, plot} = setup(),
    {xScale, yScale, cScale, maxVal, xDomain, cDomain, yearSum} = scales(),
    {xAxis, yAxis} = axes()
    gridlines = grid();

function drawPlot() {

  drawGrid();
  drawBars();
  drawLabels();
  drawLabelsSum();
  drawAxes();
  drawLegend();

}

drawPlot();

r2d3.onRender(function(data, svg, width, height, options) {

  function reAxe() {
  
    yearSum = d3.nest()
      .key(function(d) {return d.Rok})
      .rollup(function(d) {
        return d3.sum(d, function(g) {return g.n})
      })
      .entries(data),
    maxVal = d3.max(yearSum, d => d.value);
      
    yScale.domain([0, maxVal])
      .nice();
    
    svg.select('.yAxis')
      .transition()
      .call(yAxis.ticks(5));
      
    svg.select('.grid')
      .transition()
      .call(gridlines.ticks(5));
    
  }
  function reDrawBars() {
  
  let bars = plot
    .selectAll('rect.plot')
    .data(stackCalc(data))
  
  bars.exit()
    .transition()
    .remove();
    
  bars.transition()
    .attr('x', d => xScale(d.Rok))
    .attr('y', d => yScale(d.x0 + d.n))
    .attr('height', d => plotHeight - yScale(d.n))
    .attr('fill', d => cScale(d.typ));
    
  bars.enter().append('rect')
    .attr('class', 'plot')
    .attr('x', d => xScale(d.Rok))
    .attr('y', d => yScale(d.x0 + d.n))
    .attr('width', xScale.bandwidth())
    .attr('height', d => plotHeight - yScale(d.n))
    .attr('fill', d => cScale(d.typ));

}
  function reDrawLabels() {
    
    let size = 15;
  
    dropShadow();
    
    let labs = plot
      .selectAll('rect.label')
      .data(stackCalc(data))
    
    labs.exit()
      .transition()
      .remove();
    
    labs.transition()
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2 - (nChar(d.n) + 1) * 4)
      .attr('y', d => yScale(d.x0 + d.n / 2) - size / 1.666)
      .attr('width', d => (nChar(d.n) + 1) * 8)
      .attr('height', d => d.n == 0 ? 0 : size);
    
    labs.enter().append('rect')
      .attr('class', 'label')
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2 - (nChar(d.n) + 1) * 4)
      .attr('y', d => yScale(d.x0 + d.n / 2) - size / 1.666)
      .attr('width', d => (nChar(d.n) + 1) * 8)
      .attr('height', size)
      .attr('fill', d => cScale(d.typ))
//      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

    let text = plot
      .selectAll('text.label')
      .data(stackCalc(data))
    
    text.exit()
      .transition()
      .remove();
    
    text.transition()
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.x0 + d.n / 2))
      .attr('font-size', d => d.n == 0 ? 0 : size)
      .text(d => d.n);
    
    text.enter().append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.x0 + d.n / 2))
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.n);

  }
  function reDrawLabelsSum() {
    
    let size = 15;
  
    dropShadow();
    
    function nChar(n) {
      return n.toString().length;  
    }
    
    let labs = plot
      .selectAll('rect.labelSum')
      .data(yearSum)
    
    labs.exit()
      .transition()
      .remove();
    
    labs.transition()
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2 - (nChar(d.value) + 1) * 4)
      .attr('y', d => yScale(d.value + maxVal * 0.1) - size / 1.666)
      .attr('width', d => (nChar(d.value) + 1) * 8)
      .attr('height', d => d.value == 0 ? 0 : size);
    
    labs.enter().append('rect')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2 - (nChar(d.value) + 1) * 4)
      .attr('y', d => yScale(d.value + maxVal * 0.1) - size / 1.666)
      .attr('width', d => (nChar(d.value) + 1) * 8)
      .attr('height', size)
//      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

    let text = plot
      .selectAll('text.labelSum')
      .data(yearSum)
    
    text.exit()
      .transition()
      .remove();
    
    text.transition()
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value + maxVal * 0.1))
      .attr('font-size', d => d.value == 0 ? 0 : size)
      .text(d => d.value);
    
    text.enter().append('text')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value + maxVal * 0.1))
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.value);

  }
  reAxe();
  reDrawBars();
  reDrawLabels();
  reDrawLabelsSum();
  
});