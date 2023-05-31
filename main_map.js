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

d3.csv("data/ds_salaries.csv").then(function(data) {

    const citySalaries = d3.rollup(data, v => d3.mean(v, d => +d.salary_in_usd), d => countryfullname[d.employee_residence]);

    // Set up SVG
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", 800)
        .attr("height", 450);

    // Set up projection and path generator
    var projection = d3.geoMercator()
        .scale(120)
        .translate([400, 225]);

    var path = d3.geoPath()
        .projection(projection);

    // Set up color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
       .domain([0, 300000]);

    // Load and display the world map
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(world) {
        svg.selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", function(d) {
                  const city = d.properties.name;
                  const salary = citySalaries.get(city);
                  return colorScale(salary);
            });
    });
});



