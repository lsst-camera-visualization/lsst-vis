
var draw_graph = function(canvas) {
    var chart;
    chart = nv.models.historicalBarChart();
    chart
        .margin({left: 100, bottom: 100})
        .useInteractiveGuideline(true)
        .duration(250)
        ;
    // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
    chart.xAxis
        .axisLabel("Time (s)")
        .tickFormat(d3.format(',.1f'));
    chart.yAxis
        .axisLabel('Voltage (v)')
        .tickFormat(d3.format(',.2f'));
    chart.showXAxis(true);
    // d3.select(svg_id)
    canvas.append('svg')
        .datum(sinData())
        .transition()
        .call(chart);
    nv.utils.windowResize(chart.update);
    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
    return chart;
}
//Simple test data generators
function sinAndCos() {
    var sin = [],
        cos = [];
    for (var i = 0; i < 100; i++) {
        sin.push({x: i, y: Math.sin(i/10)});
        cos.push({x: i, y: .5 * Math.cos(i/10)});
    }
    return [
        {values: sin, key: "Sine Wave", color: "#ff7f0e"},
        {values: cos, key: "Cosine Wave", color: "#2ca02c"}
    ];
}
function sinData() {
    var sin = [];
    for (var i = 0; i < 100; i++) {
        sin.push({x: i, y: Math.sin(i/10) * Math.random() * 100});
    }
    return [{
        values: sin,
        key: "Sine Wave",
        color: "#ff7f0e"
    }];
}


historicalBarChart = [
    {
        key: "Cumulative Return",
        values: [
            {
                "label" : "A" ,
                "value" : 29.765957771107
            } ,
            {
                "label" : "B" ,
                "value" : 0
            } ,
            {
                "label" : "C" ,
                "value" : 32.807804682612
            } ,
            {
                "label" : "D" ,
                "value" : 196.45946739256
            } ,
            {
                "label" : "E" ,
                "value" : 0.19434030906893
            } ,
            {
                "label" : "F" ,
                "value" : 98.079782601442
            } ,
            {
                "label" : "G" ,
                "value" : 13.925743130903
            } ,
            {
                "label" : "H" ,
                "value" : 5.1387322875705
            }
        ]
    }
];
var draw_graph2 = function(canvas) {
    var chart = nv.models.discreteBarChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .staggerLabels(true)
        //.staggerLabels(historicalBarChart[0].values.length > 8)
        .showValues(true)
        .duration(250)
        ;
    // d3.select('#chart2')
    canvas.append('svg')
        .datum(historicalBarChart)
        .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
};

// nv.addGraph(function(){return draw_graph('#test1')});
