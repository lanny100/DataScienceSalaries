//Data tools
function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil')
    .replace('G','bil')
    .replace('T','tri')
}

// deal with empty value
const parseNA = string => (string === 'NA' ? undefined : string);

// format trasform & column selection & add
function type(d){
    return{
        experience_level:parseNA(d.experience_level),
        job_title:parseNA(d.job_title),
        salary:+d.salary,
        salary_currency:parseNA(d.salary_currency),
        salary_in_usd:+d.salary_in_usd,
        employee_residence:parseNA(d.employee_residence),
        remote_ratio:+d.remote_ratio,
        company_location:parseNA(d.company_location),
        company_size:parseNA(d.company_size),
    }
}

const countryname = {
    IL : "以色列",
    JP : "日本",
    US : "美國",
    CA : "加拿大", 
    CH : "瑞士",
    DE : "德國" ,
    IE : "愛爾蘭",
    AE : "阿聯酋" ,
    UZ : "烏茲別克斯坦", 
    NL : "荷蘭" ,
    JE : "澤西島", 
    LT : "立陶宛",
    GB : "英國",
    HR : "克羅地亞",
    RU : "俄羅斯",
    UA : "烏克蘭",
    AU : "澳大利亞",
    AT : "奧地利",
    FI : "芬蘭",
    HK : "香港",
    ES : "西班牙",
    LV : "拉脫維亞",
    CO : "哥倫比亞",
    PT : "葡萄牙",
    GR : "希臘",
    AM : "亞美尼亞",
    FR : "法國",
    IT : "義大利",
    MX : "墨西哥",
    IN : "印度",
    RO : "羅馬尼亞",
    AS : "美屬薩摩亞",
    HN : "洪都拉斯",
    PK : "巴基斯坦",
    GH : "迦納",
    MD : "摩爾多瓦",
    BR : "巴西",
    NG : "尼日利亞",
    ID : "印尼",
    VN : "越南",
    TR : "土耳其",
    MK : "馬其頓",
    CY : "賽普勒斯",
    PR : "波多黎各",
    CN : "中國",
    NZ : "紐西蘭",
    BA : "波士尼亞",
    DZ : "阿爾及利亞",
    IQ : "伊拉克",
    SE : "瑞典",
    SG : "新加坡",
    CZ : "捷克",
    BE : "比利時",
    RO : "羅馬尼亞",
    KW : "科威特",
    TH : "泰國",
    HU : "匈牙利",
    DK : "丹麥",
    MT : "馬爾他",
    SI : "斯洛維尼亞",
    CR : "哥斯達黎加",
    MA : "摩洛哥",
    BO : "玻利維亞", 
    MY : "馬來西亞",
    DO : "多明尼加",
    IR : "伊朗",
    BG : "保加利亞",
    CL : "智利",
    LU : "盧森堡",
    CF : "中非共和國",
    PH : "菲律賓",
    PL : "波蘭",
    AR : "阿根廷",
    KE : "肯亞",
    EE : "愛沙尼亞",
    TN : "突尼斯",
    RS : "塞爾維亞",
    EG : "埃及",
    SK : "斯洛伐克",
};

//screen draw
function setupCanvas(barChartData,barChartData2,salaryClean){
    let metric = '0';
    let metric2 = 'SE';

 
    function click1(){
        metric = this.dataset.name;
        const thisData = chooseData1(metric,salaryClean);
        // console.log(thisData);
        const dataMap = d3.rollup(
            thisData,
            v => d3.mean(v, leaf => leaf.salary_in_usd),
            d => countryname[d.employee_residence]
        );
        const dataArray = Array.from(dataMap, d => ({countryname:d[0], salary_in_usd:d[1]}));
        const dataArraysort = dataArray.sort((a,b)=>b.salary_in_usd - a.salary_in_usd).slice(0,30);
        update(dataArraysort);
    }

    function click2(){
        metric2 = this.dataset.name;
        const thisData = chooseData2(metric2,salaryClean);
        // console.log(thisData);
        const dataMap = d3.rollup(
            thisData,
            v => d3.mean(v, leaf => leaf.salary_in_usd),
            d => countryname[d.employee_residence]
        );
        const dataArray = Array.from(dataMap, d => ({countryname:d[0], salary_in_usd:d[1]}));
        const dataArraysort = dataArray.sort((a,b)=>b.salary_in_usd - a.salary_in_usd).slice(0,30);
        // console.log(dataArray);
        update2(dataArraysort);
    }

    d3.selectAll('.b1').on('click',click1);
    d3.selectAll('.b2').on('click',click2);

    
    function update(data){
        console.log(data);
        //Update Scale
        xMax = d3.max(data,d=>d.salary_in_usd);
        xScale_v3 = d3.scaleLinear([0,xMax],[0,chart_width]);
        yScale = d3.scaleBand().domain(data.map(d=>d.countryname))
                   .rangeRound([0,chart_height])
                   .paddingInner(0.25);
        //Transition Settings
        const defaultDelay = 1000;
        const transitionDelay = d3.transition().duration(defaultDelay);

        //Update axis
        xAxisDraw.transition(transitionDelay).call(xAxis.scale(xScale_v3));
        yAxisDraw.transition(transitionDelay).call(yAxis.scale(yScale));

        //Update Header
        header.select('tspan').text(` ${metric} percent remote ratio data scientist salary ${metric ==='popularity' ? '' : 'in $US'}`).style('font-size','1.2em').style('fill','white');

        //Update Bar
        bars.selectAll('.bar').data(data,d=>d.countryname).join(
            enter => {
                enter.append('rect').attr('class','bar')
                     .attr('x',0).attr('y',d=>yScale(d.countryname))
                     .attr('height',yScale.bandwidth())
                     .style('fill','lightcyan')
                     .transition(transitionDelay)
                     .delay((d,i)=>i*20)
                     .attr('width',d=>xScale_v3(d.salary_in_usd))
                     .style('fill','dodgerblue')
            },
            update => {
                update.transition(transitionDelay)
                      .attr('height',yScale.bandwidth())
                      .delay((d,i) => i * 20)
                      .attr('y', d => yScale(d.countryname))
                      .attr('width',d=>xScale_v3(d.salary_in_usd))
            },
            exit => {
                exit.transition().duration(defaultDelay/2)
                    .style('fill-opacity',0).remove()
            }
        );

        d3.selectAll('.bar')
          .on('mouseover',mouseover)
          .on('mousemove',mousemove)
          .on('mouseout',mouseout)
    }

    function update2(data){
        console.log(data);
        //Update Scale
        xMax2 = d3.max(data,d=>d.salary_in_usd);
        xScale_v3_2 = d3.scaleLinear([0,xMax2],[0,chart_width]);
        yScale2 = d3.scaleBand().domain(data.map(d=>d.countryname))
                   .rangeRound([0,chart_height])
                   .paddingInner(0.25);
        //Transition Settings
        const defaultDelay = 1000;
        const transitionDelay = d3.transition().duration(defaultDelay);

        //Update axis
        xAxisDraw2.transition(transitionDelay).call(xAxis2.scale(xScale_v3_2));
        yAxisDraw2.transition(transitionDelay).call(yAxis2.scale(yScale2));

        //Updaye Header
        header2.select('tspan').text(` ${metric2} data scientist salary ${metric2 ==='popularity' ? '' : 'in $US'}`).style('font-size','1.2em').style('fill','white');

        //Update Bar
        bars2.selectAll('.bar').data(data,d=>d.countryname).join(
            enter => {
                enter.append('rect').attr('class','bar')
                     .attr('x',0).attr('y',d=>yScale2(d.countryname))
                     .attr('height',yScale2.bandwidth())
                     .style('fill','lightcyan')
                     .transition(transitionDelay)
                     .delay((d,i)=>i*20)
                     .attr('width',d=>xScale_v3_2(d.salary_in_usd))
                     .style('fill','dodgerblue')
            },
            update => {
                update.transition(transitionDelay)
                      .attr('height',yScale2.bandwidth())
                      .delay((d,i) => i * 20)
                      .attr('y', d => yScale2(d.countryname))
                      .attr('width',d=>xScale_v3_2(d.salary_in_usd))
            },
            exit => {
                exit.transition().duration(defaultDelay/2)
                    .style('fill-opacity',0).remove()
            }
        );

        d3.selectAll('.bar')
          .on('mouseover',mouseover)
          .on('mousemove',mousemove)
          .on('mouseout',mouseout)
    }

    const svg_width = 700;
    const svg_height = 650;
    const chart_margin = {top:80,right:80,bottom:5,left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    const this_svg = d3.select('.bar-chart-container').append('svg')
                       .attr('width',svg_width).attr('height',svg_height)
                       .append('g')
                       .attr('transform',`translate(${chart_margin.left},${chart_margin.top})`);   
                       
    const this_svg2 = d3.select('.bar-chart-container2').append('svg')
                       .attr('width',svg_width).attr('height',svg_height)
                       .append('g')
                       .attr('transform',`translate(${chart_margin.left},${chart_margin.top})`); 
    //Find min & max  
    //const xExtent = d3.extent(salaryClean, d=>d.salary_in_usd);
    //debugger;
    //const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0, chart_width]);
    let xMax = d3.max(salaryClean, d=>d.salary_in_usd);
    //let xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,chart_width]);
    let xScale_v3 = d3.scaleLinear([0, xMax],[0, chart_width]);

    //vetrical space ->Top 15 xxx movies
    let yScale = d3.scaleBand().domain(salaryClean.map(d=>d.countryname))
                    .rangeRound([0, chart_height])
                    .paddingInner(0.25)
                    //.paddingOuter(8);
    console.log(yScale.bandwidth());

    let xMax2 = d3.max(salaryClean, d=>d.salary_in_usd);
    let xScale_v3_2 = d3.scaleLinear([0, xMax2],[0, chart_width]);

    //vetrical space ->Top 15 xxx movies
    let yScale2 = d3.scaleBand().domain(salaryClean.map(d=>d.countryname))
                    .rangeRound([0, chart_height])
                    .paddingInner(0.25);
    console.log(yScale.bandwidth());

    const bars = this_svg.append('g').attr('class','bars');
    const bars2 = this_svg2.append('g').attr('class','bars');

    //Draw header
    let header = this_svg.append('g').attr('class','bar-header')
                        .attr('transform',`translate(0,${-chart_margin.top/2})`)
                        .append('text');
    let header2 = this_svg2.append('g').attr('class','bar-header')
                        .attr('transform',`translate(0,${-chart_margin.top/2})`)
                        .append('text');
    //header.append('tspan').text('Total revenue by genre in $US');
    header.append('tspan').text('xxx data scientist');
    header.append('tspan').text('Years:2020-2023')
            .attr('x',0).attr('y',15).style('font-size','0.8em').style('fill','#bbb');

    header2.append('tspan').text('xxx data scientist');
    header2.append('tspan').text('Years:2020-2023')
            .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#bbb');

    let xAxis = d3.axisTop(xScale_v3).ticks(5)
                    .tickFormat(formatTicks)
                    .tickSizeInner(-chart_height)
                    .tickSizeOuter(0);
    let xAxis2 = d3.axisTop(xScale_v3_2).ticks(5)
                    .tickFormat(formatTicks)
                    .tickSizeInner(-chart_height)
                    .tickSizeOuter(0);
    let xAxisDraw = this_svg.append('g').attr('class','x axis');
    let xAxisDraw2 = this_svg2.append('g').attr('class','x axis');

    let yAxis = d3.axisLeft(yScale).tickSize(0);
    let yAxis2 = d3.axisLeft(yScale2).tickSize(0);
    let yAxisDraw = this_svg.append('g').attr('class','y axis');
    let yAxisDraw2 = this_svg2.append('g').attr('class','y axis');
    yAxisDraw.selectAll('text').attr('dx','-0.6em');
    yAxisDraw2.selectAll('text').attr('dx','-0.6em');

    update(barChartData);
    update2(barChartData2);
    const tip = d3.select('.tooltip');

    function formatTicks(d){
        return d3.format('.2s')(d)
                 .replace('M','mil').replace('G','bil').replace('T','tri')
    }

    function mouseover(e){
        //get data
        const thisBarData = d3.select(this).data()[0];
        // debugger;
        // console.log("1",thisBarData.salary_in_usd);
        const bodyData = [
            ['salary_in_usd',thisBarData.salary_in_usd],
        ];
        console.log("[bodyData]", bodyData);
        tip.style('left',(e.clientX+15)+'px')
           .style('top',e.clientY+'px')
           .transition()
           .style('opacity',0.98)
           
        tip.select('h13').html(`${thisBarData.countryname}`);

        d3.select('.tip-body').selectAll('p').data(bodyData)
        .join('p').attr('class','tip-info')
        .html(d=>`${d[0]} : ${d[1]}`);
    }
    function mousemove(e){
        tip.style('left',(e.clientX+15)+'px')
           .style('top',e.clientY+'px')
    }
    function mouseout(e){
        tip.transition()
           .style('opacity',0)
    }
    d3.selectAll('.bar')
      .on('mouseover',mouseover)
      .on('mousemove',mousemove)
      .on('mouseout',mouseout);

}

//Main
function ready(ds_salaries){
    const salaryClean = chooseData1("salary_in_usd",ds_salaries);
    const salaryData = chooseData2("salary_in_usd",ds_salaries);
    setupCanvas(salaryClean,salaryData,ds_salaries);
}

function chooseData1(metric,salaryClean){
    const thisData = salaryClean;
    return thisData.filter(
        d=>{
            return(
                d.salary_in_usd > 0 &&
                d.remote_ratio == metric
            );
        });
}

function chooseData2(metric,salaryData){
    
    const thisData = salaryData;

    return thisData.filter(
        d => {
            return(
                d.salary_in_usd > 0 &&
                d.experience_level == metric
            );
        }
    );
}

//Load Data
d3.csv('data/ds_salaries.csv', type).then(
    res=>{
        ready(res);
    }
);
