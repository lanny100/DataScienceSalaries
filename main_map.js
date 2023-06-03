const countryfullname = {
    IL : "Israel",
    JP : "Japan",
    US : "USA",
    CA : "Canada", 
    CH : "Switzerland",
    DE : "Germany" ,
    IE : "Ireland",
    AE : "United Arab Emirates" ,
    UZ : "Uzbekistan", 
    NL : "Netherlands" ,
    JE : "Jersey", 
    LT : "Lithuania",
    GB : "England",
    HR : "Croatia",
    RU : "Russia",
    UA : "Ukraine",
    AU : "Australia",
    AT : "Austria",
    FI : "Finland",
    HK : "Hongkong",
    ES : "Spain",
    LV : "Latvia",
    CO : "Colombia",
    PT : "Portugal",
    GR : "Greece",
    AM : "Armenia",
    FR : "France",
    IT : "Italy",
    MX : "Mexico",
    IN : "India",
    RO : "Romania",
    AS : "American Samoa",
    HN : "Honduras",
    PK : "Pakistan",
    GH : "Ghana",
    MD : "Moldova",
    BR : "Brazil",
    NG : "Nigeria",
    ID : "Indonesia",
    VN : "Vietnam",
    TR : "Turkey",
    MK : "Macedonia",
    CY : "Cyprus",
    PR : "Puerto Rico",
    CN : "China",
    NZ : "New Zealand",
    BA : "Bosnia and Herzegovina",
    DZ : "Algeria",
    IQ : "Iraq",
    SE : "Sweden",
    SG : "Singapore",
    CZ : "Czech Republic",
    BE : "Belgium",
    RO : "Romania",
    KW : "Kuwait",
    TH : "Thailand",
    HU : "Hungary",
    DK : "Denmark",
    MT : "Malta",
    SI : "Slovenia",
    CR : "Costa Rica",
    MA : "Morocco",
    BO : "Bolivia", 
    MY : "Malaysia",
    DO : "Dominican Republic",
    IR : "Iran",
    BG : "Bulgaria",
    CL : "Chile",
    LU : "Luxembourg",
    CF : "Central African Republic",
    PH : "Philippines",
    PL : "Poland",
    AR : "Argentina",
    KE : "Kenya",
    EE : "Estonia",
    TN : "Tunisia",
    RS : "Serbia",
    EG : "Egypt",
    SK : "Slovakia",
};
// Load data

d3.csv('data/ds_salaries.csv').then(function(data) {
    //average
    const citySalaries = d3.rollup(data, v => d3.mean(v, d => +d.salary_in_usd), d => countryfullname[d.employee_residence]);

    //interact
    const tip = d3.select('.tooltip');
    function formatTicks(d){
        return d3.format('.2s')(d)
                .replace('M','mil').replace('G','bil').replace('T','tri')
    }
    function mouseover1(e){
        //get data
        const thisData1 = d3.select(this).data()[0];
        console.log(thisData1);
        const bodyData = [
            ['salary_in_usd',formatTicks(citySalaries.get(thisData1.properties.name))],
        ];
        tip.style('left',(e.clientX+15)+'px')
        .style('top',e.clientY+'px')
        .transition()
        .style('opacity',0.98)
        
        tip.select('h13').html(`${thisData1.properties.name}`);

        d3.select('.tip-body').selectAll('p').data(bodyData)
        .join('p').attr('class','tip-info')
        .html(d=>`${d[0]} : ${d[1]}`);
    }
    function mousemove1(e){
        tip.style('left',(e.clientX+15)+'px')
        .style('top',e.clientY+'px')
    }
    function mouseout1(e){
        tip.transition()
        .style('opacity',0)
    }
    // Set up SVG
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", 800)
        .attr("height", 450);

    // Set up projection and path generator
    var projection = d3.geoMercator()
        .scale(120)
        .translate([400, 225]);

    var path1 = d3.geoPath()
        .projection(projection);

    // Set up color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
       .domain([0, 300000]);

    // Load and display the world map
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(world) {
        svg.selectAll(path1)
            .data(world.features)
            .enter()
            .append("path")
            .attr('class','map')
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", function(d) {

                  const salary = citySalaries.get(d.properties.name);
                  return colorScale(salary);
            });
        d3.selectAll('.map')
            .on('mouseover', mouseover1)
            .on('mousemove', mousemove1)
            .on('mouseout', mouseout1);
    });
});

