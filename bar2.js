// !preview r2d3 data=data

let margin = {
    left: 50,
    bottom: 50,
    top: 50,
    right: 20
  };
  
  let plotWidth = width - margin.left - margin.right,
      plotHeight = height - margin.top - margin.bottom;
      
  let plot = svg.append('g')
    .attr('class', 'plot')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
      
  

let xDomain = [...new Set(data.map(d => d.Rok))],
      cDomain = [...new Set(data.map(d => d.typ))],
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
          'rgb(144, 237, 125)',
          'rgb(67, 67, 72)',
          'rgb(124, 181, 236)'
        ]);
      

let xAxis = d3.axisBottom()
        .scale(xScale),
      yAxis = d3.axisLeft()
        .scale(yScale)
        .tickValues([...Array(6).keys()].map(d => d * 100));

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

plot.append('g')
    .attr('class', 'xAxis axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(xAxis);
    
  plot.append('g')
    .attr('class', 'yAxis axis')
    .call(yAxis);

let size = 15;

  
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
      .style('filter', 'url(#drop-shadow)')
      .attr('rx', 1);

  plot.selectAll('label')
    .data(stackCalc(data))
    .enter()
    .append('text')
      .attr('class', d => d.typ)
      .attr('x', d => xScale(d.Rok) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.x0 + d.n / 2))
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', size)
      .text(d => d.n);

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
  
let gridlines = d3.axisRight()
    .tickFormat('')
    .tickSize(plotWidth)
    .scale(yScale);

  plot.append('g')
     .attr('class', 'grid')
     .call(gridlines);

r2d3.onRender(function(data, svg, width, height, options) {
  
let cDomain = [...new Set(data.map(d => d.typ))],
      yearSum = d3.nest()
        .key(function(d) {return d.Rok})
        .rollup(function(d) {
          return d3.sum(d, function(g) {return g.n})
        })
        .entries(data),
      maxVal = d3.max(yearSum, d => d.value);
      
  yScale.domain([0, maxVal]);
  cScale.domain(cDomain);
  yAxis.scale(yScale);
  
  svg.select('.yAxis')
    .transition()
    .call(yAxis)

 let bars = svg
    .selectAll('rect.plot')
    .data(data)
  
  bars.exit().remove();
    
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
  
});