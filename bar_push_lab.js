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
function fmt(n) {
  
  let f = d3.format(',');
  return f(n).replace(',', ' ').replace(',', ' ');
  
}
function scales() {

  let xDomain = [...new Set(data.map(d => d.Rok))],
      cDomain = [...new Set(data.map(d => d.typ))],
      yearSum = d3.nest()
        .key(function(d) {return d.Rok})
        .rollup(function(d) {
          return d3.sum(d, function(g) {return g.n})
        })
        .entries(data),
      maxVal = d3.max(yearSum, d => d.value);
      
  yearSum = yearSum.map(row => ({
    key: row.key,
    value: row.value,
    lab: row.value
  }));
  
  let yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([plotHeight, 0])
        .nice(),
      xScale = d3.scaleBand()
        .domain(xDomain)
        .range([0, plotWidth])
        .padding(0.5),
      cScale = d3.scaleOrdinal()
        .domain(cDomain)
        .range([
          'rgb(67, 67, 72)',
          'rgb(124, 181, 236)',
          'rgb(125, 234, 102)',
          'rgb(247, 163, 92)'
        ]);
        
    return {xScale, yScale, cScale, maxVal, xDomain, cDomain, yearSum, maxVal};

}
function axes() {
  
  let xAxis = d3.axisBottom(xScale)
        .tickSizeOuter(0),
      yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".0s"));
  
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
function labPosCalc(data) {
  
  let size = 15;
  
  let labPos = data.map(d => ({
    rX: xScale(d.Rok) + xScale.bandwidth() / 2 - (nChar(d.n) + 1) * 4,
    rY: yScale(d.x0 + d.n / 2) - size / 1.666,
    rW: (nChar(d.n) + 1) * 8,
    rF: cScale(d.typ),
    tX: xScale(d.Rok) + xScale.bandwidth() / 2,
    tY: yScale(d.x0 + d.n / 2),
    tT: fmt(d.n),
    rTop: yScale(d.x0 + d.n),
    Rok: d.Rok,
    n: d.n
  }));

  for (let o = 0; o < 10; o++) {  
    
    for (let i = 1; i < labPos.length; i++) {
      
      if (labPos[i-1].Rok == labPos[i].Rok) {
        
        var diff = labPos[i-1].rY - labPos[i].rY;
        
        if (diff < size && labPos[i-1].n * labPos[i].n != 0) {
          
          var cor = (size - diff) / 2;
          
          if (labPos[i-1].rY < 215) {
            labPos[i-1].rY += cor;
            labPos[i].rY -= cor;
            labPos[i-1].tY += cor;
            labPos[i].tY -= cor;
          } else {
            labPos[i].rY -= cor * 2;
            labPos[i].tY -= cor * 2;
          }
        }
      }
    }
  }
 
  return labPos;
  
}
function labPosSumCalc(dt) {
  
  let labPosSum = dt.map((d, i) => ({
    Rok: d.Rok,
    pos: (d.tY - 7.5 < d.rTop && d.n != 0) ? d.tY - 7.5 : d.rTop
  }));
  
  labPosSum = d3.nest()
    .key(function(d) {return d.Rok})
    .rollup(function(d) {
      return d3.min(d, function(g) {return g.pos})
    })
    .entries(labPosSum);
    
  labPosSum = labPosSum.map((d, i) => ({
    key: d.key,
    value: d.value - 15,
    lab: yearSum[i].value
  }));
  
  return labPosSum;
  
}
function drawBars(data) {
  
  plot.selectAll('rect')
    .data(data)
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
function drawLabels(data) {
  
  let size = 15;
  
//  dropShadow();
  
  plot.selectAll('label')
    .data(labPos)
    .enter()
    .append('rect')
      .attr('class', 'label')
      .attr('x', d => d.rX)
      .attr('y', d => d.rY)
      .attr('width', d => d.rW)
      .attr('height', size)
      .attr('fill', d => d.rF)
//      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

  plot.selectAll('label')
    .data(labPos)
    .enter()
    .append('text')
      .attr('class', 'label')
      .attr('x', d => d.tX)
      .attr('y', d => d.tY)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.tT);

}
function drawLabelsSum(data) {

  let size = 15;
  
//  dropShadow();
  
  plot.selectAll('labelSum')
    .data(data)
    .enter()
    .append('rect')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2 - (nChar(d.lab) + 1) * 4)
      .attr('y', d => d.value - size / 1.666)
      .attr('width', d => (nChar(d.lab) + 1) * 8)
      .attr('height', size)
//      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

  plot.selectAll('labelSum')
    .data(data)
    .enter()
    .append('text')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2)
      .attr('y', d => d.value)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => fmt(d.lab));
  
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
  
  let circle_r = 8,
      text_s = 12,
      margin = 6,
      len = cDomain.length;

  let lgnd = plot
    .append('g')
    .attr('class', 'legend')
    
  plot.selectAll('legend')
    .data(cDomain)
    .enter()
    .append('text')
      .attr('class', 'check')
      .attr('fill', 'transparent')
      .attr('font-size', text_s)
      .text(d => d);

  let txt_el = plot.selectAll('text.check')._groups[0];
  let txt_width = [...txt_el].map(d => d.getBoundingClientRect().width);

  let legend = [{
    x: 0,
    y: 0,
    lab: cDomain[0],
    fill: cScale(cDomain[0])
  }];

  for (let i = 1; i < len; i++) {
    legend.push({
      x: legend[i-1].x + circle_r * 2 + txt_width[i-1] + margin * 2,
      y: 0,
      lab: cDomain[i],
      fill: cScale(cDomain[i])
    })
  }

  lgnd.selectAll('legend')
    .data(legend)
    .enter()
    .append('circle')
      .attr('r', circle_r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('fill', d => d.fill);
  
  lgnd.selectAll('legend')
    .data(legend)
    .enter()
    .append('text')
      .attr('x', d => d.x + circle_r + margin)
      .attr('y', d => d.y)
      .attr('font-size', text_s)
      .attr('alignment-baseline', 'middle')
      .text(d => d.lab);
  
  let offset = (plotWidth - (legend[len-1].x + circle_r + txt_width[len-1] + margin)) / 2
  lgnd.attr('transform', `translate(${offset}, ${300})`)
  
}

let {margin, plotWidth, plotHeight, plot} = setup(),
    {xScale, yScale, cScale, maxVal, xDomain, cDomain, yearSum} = scales(),
    {xAxis, yAxis} = axes()
    gridlines = grid()
    stackData = stackCalc(data)
    labPos = labPosCalc(stackData);
    labPosSum = labPosSumCalc(labPos);

function drawPlot() {

  drawGrid();
  drawBars(stackData);
  drawLabels(labPos);
  drawLabelsSum(labPosSum);
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
    
    yearSum = yearSum.map(row => ({
      key: row.key,
      value: row.value,
      lab: row.value
    }));
      
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
    
    let size = 15,
        labData = labPosCalc(stackCalc(data));
  
    let labs = plot
      .selectAll('rect.label')
      .data(labData)
    
    labs.exit()
      .transition()
      .remove();
    
    labs.transition()
      .attr('x', d => d.rX)
      .attr('y', d => d.rY)
      .attr('width', d => d.rW)
      .attr('height', d => d.n == 0 ? 0 : size);
    
    labs.enter().append('rect')
      .attr('class', 'label')
      .attr('x', d => d.rX)
      .attr('y', d => d.rY)
      .attr('width', d => d.rW)
      .attr('height', size)
      .attr('fill', d => d.rF)
      .attr('rx', 1);

    let text = plot
      .selectAll('text.label')
      .data(labData)
    
    text.exit()
      .transition()
      .remove();
    
    text.transition()
      .attr('x', d => d.tX)
      .attr('y', d => d.tY)
      .attr('font-size', d => d.n == 0 ? 0 : size)
      .text(d => d.tT);
    
    text.enter().append('text')
      .attr('class', 'label')
      .attr('x', d => d.tX)
      .attr('y', d => d.tY)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.tT);

  }
  function reDrawLabelsSum() {
    
    let size = 15,
        dane = labPosSumCalc(labPosCalc(stackCalc(data)));
    
    let labs = plot
      .selectAll('rect.labelSum')
      .data(dane)
    
    labs.exit()
      .transition()
      .remove();
    
    labs.transition()
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2 - (nChar(d.lab) + 1) * 4)
      .attr('y', d => d.value - size / 1.666)
      .attr('width', d => (nChar(d.lab) + 1) * 8)
      .attr('height', d => d.value == 0 ? 0 : size);
    
    labs.enter().append('rect')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2 - (nChar(d.lab) + 1) * 4)
      .attr('y', d => d.value - size / 1.666)
      .attr('width', d => (nChar(d.lab) + 1) * 8)
      .attr('height', size)
      .attr('rx', 1);

    let text = plot
      .selectAll('text.labelSum')
      .data(dane)
    
    text.exit()
      .transition()
      .remove();
    
    text.transition()
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2)
      .attr('y', d => d.value)
      .attr('font-size', d => d.value == 0 ? 0 : size)
      .text(d => fmt(d.lab));
    
    text.enter().append('text')
      .attr('class', 'labelSum')
      .attr('x', d => xScale(d.key) + xScale.bandwidth() / 2)
      .attr('y', d => d.value)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => fmt(d.lab));

  }
  reAxe();
  reDrawBars();
  reDrawLabels();
  reDrawLabelsSum();
  console.table(labPosSumCalc(labPosCalc(stackCalc(data))));
});