// const parseNA = string => (string === 'NA' ? undefined : string);

function type(d){
    return {
        work_year: +d.work_year,
        experience_level: parseNA(d.experience_level),
        employment_type: parseNA(d.employment_type),
        job_title: parseNA(d.employment_type),
        salary: +d.salary,
        salary_currency: parseNA(d.salary_currency),
        salary_in_usd: +d.salary_in_usd,
        employee_residence: parseNA(d.employee_residence),
        remote_ratio: +d.remote_ratio,
        company_location: parseNA(d.company_location),
        company_size: parseNA(d.company_size),
    }
}

function filterData(dataset, experience_level) {
    return dataset.filter(
        d => {
            return(
                d.experience_level == experience_level
            );
        }
    );
}

var enArray, exArray, miArray, seArray;

function prepareData(data){
    const groupByYear = d => d.work_year;
    const meanSalaryOfEN = values => d3.mean(values, d => d.salary_in_usd);
    const temp = d3.rollup(data, meanSalaryOfEN, groupByYear);
    return Array.from(temp).sort((a,b)=>a[0]-b[0]);
}

function prepareLineChartData(){
    const dates = enArray.map(d=>d[0]);
    const array = enArray.map(d=>d[1]).concat(exArray.map(d=>d[1]), miArray.map(d=>d[1]), seArray.map(d=>d[1]));
    const yMax = d3.max(array);

    const lineData = {
        series:[
            {
                name: 'EN',
                color: 'dodgerblue',
                values: enArray.map(d=>({date:d[0], value:d[1]}))
            },
            {
                name: 'EX',
                color: 'darkorange',
                values: exArray.map(d=>({date:(d[0]), value:d[1]}))
            },
            {
                name: 'MI',
                color: 'red',
                values: miArray.map(d=>({date:(d[0]), value:d[1]}))
            },
            {
                name: 'SE',
                color: 'green',
                values: seArray.map(d=>({date:(d[0]), value:d[1]}))
            }
        ],
        dates: dates,
        yMax: yMax
    }
    return lineData;
}

function setupCanvas1(lineChartData){
    const svg_width = 700;
    const svg_height = 500;
    const chart_margin = {top:80, right:60, bottom:40, left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    const this_svg = d3.select('.line-chart-container')
                       .append('svg')
                       .attr('width', svg_width)
                       .attr('height', svg_height)
                       .append('g')
                       .attr('transform',`translate(${chart_margin.left}, ${chart_margin.top})`);
    
    const xExtent = d3.extent(lineChartData.dates);
    const xScale = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    const yScale = d3.scaleLinear().domain([0, lineChartData.yMax]).range([chart_height, 0]);
    const lineGen = d3.line().x(d=>xScale(d.date)).y(d=>yScale(d.value));
    const chartGroup = this_svg.append('g').attr('class', 'line-chart');

    chartGroup.selectAll('.line-series')
              .data(lineChartData.series)
              .enter()
              .append('path')
              .attr('class', d=>`line-series ${d.name.toLowerCase()}`)
              .attr('d', d=>lineGen(d.values))
              .attr('stroke-width', 3)
              .style('fill', 'none')
              .style('stroke', d=>d.color);

    const xAxis = d3.axisBottom(xScale).ticks(4).tickFormat(d3.format("d"));
    this_svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', `translate(0, ${chart_height})`)
            .call(xAxis);
            
    const yAxis = d3.axisLeft(yScale).ticks(10)
                    .tickSizeInner(-chart_width).tickSizeOuter(0);
    this_svg.append('g').attr('class', 'yaxis').call(yAxis);

    chartGroup.append('g').attr('class', 'series-labels')
              .selectAll('.series-label').data(lineChartData.series).enter()
              .append('text')
              .attr('x', d=>xScale(d.values[d.values.length-1].date)+5)
              .attr('y', d=>yScale(d.values[d.values.length-1].value))
              .text(d=>d.name)
              .style('dominant-baseline', 'central')
              .style('font-size', '0.9em').style('font-weight', 'bold')
              .style('fill', d=>d.color);

    const header_Line = this_svg.append('g')
                                .attr('class', 'bar-header')
                                .attr('transform', `translate(0, ${-chart_margin.top/2})`)
                                .append('text');
    header_Line.append('tspan').text('Average salary for different experience level over time in $US').style('font-size','1.2em').style('fill','white');
    header_Line.append('tspan').text('2020-2023')
                               .attr('x', 0)
                               .attr('y', 20)
                               .style('font-size', '0.8em')
                               .style('fill', '#bbb');

    const tip = d3.select('.tooltip');

    function mouseover(e){
        console.log(d3.select(this).data())
        const thisLineData = d3.select(this).data()[0];
        const bodyData = [
            [thisLineData.values[0].date, d3.format('.2s')(thisLineData.values[0].value)],
            [thisLineData.values[1].date, d3.format('.2s')(thisLineData.values[1].value)],
            [thisLineData.values[2].date, d3.format('.2s')(thisLineData.values[2].value)],
            [thisLineData.values[3].date, d3.format('.2s')(thisLineData.values[3].value)]
        ]

        tip.style('left', (e.clientX+15)+'px')
           .style('top', e.clientY+'px')
           .transition()
           .style('opacity', 0.98);

        tip.select('h13').html(`${thisLineData.name}`);

        d3.select('.tip-body').selectAll('p').data(bodyData)
          .join('p').attr('class', 'tip-info')
          .html(d=>`${d[0]}: ${d[1]}`)
    }

    function mousemove(e){
        tip.style('left', (e.clientX+15)+'px')
           .style('top', e.clientY+'px')
           .style('opacity', 0.98);
    }

    function mouseout(e){
        tip.transition()
           .style('opacity', 0);
    }

    d3.selectAll('.line-series')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);

}

function ready1(dataset){
    let datasetClean = filterData(dataset, "EN");
    enArray = prepareData(datasetClean);
    datasetClean = filterData(dataset, "EX");
    exArray = prepareData(datasetClean);
    datasetClean = filterData(dataset, "MI");
    miArray = prepareData(datasetClean);
    datasetClean = filterData(dataset, "SE");
    seArray = prepareData(datasetClean);
    const lineChartData = prepareLineChartData();
    setupCanvas1(lineChartData);
}

d3.csv('data/ds_salaries.csv',type).then(
    res => {
        ready1(res);
    }
);
