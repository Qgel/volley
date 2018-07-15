winchance_player_graph = function (anchor, data, total_winchance, width = 350, height = 320, labelSpace = 80) {
    let radius = Math.min(width - labelSpace, height - labelSpace) / 2,
        innerRadius = 0.3 * radius;

    let colors = [
        "#9E0041",
        "#C32F4B",
        "#E1514B",
        "#F47245",
        "#FB9F59",
        "#FEC574",
        "#FAE38C",
        "#EAF195",
        "#C7E89E",
        "#9CD6A4",
        "#6CC4A4",
        "#4D9DB4",
        "#4776B4",
        "#5E4EA1"
    ];

    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.width;
        });

    function tip(selection) {
        selection.classed('aster-popup', true)
            .attr('data-html', function (d) {
                return d.data.name + " (" + d.data.score + "%)";
            });
    }

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(function (d) {
            return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
        });

    var outlineArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    var svg = d3.select(anchor).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll(".solidArc")
        .data(pie(data))
        .enter().append("path")
        .attr("fill", function (d, i) {
            return colors[i % colors.length];
        })
        .attr("class", "solidArc")
        .attr("stroke", "gray")
        .attr("d", arc)
        .call(tip);

    var g = svg.selectAll(".outlineArc")
        .data(pie(data))
        .enter().append("g");

    svg.append("svg:text")
        .attr("class", "aster-score")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle") // text-align: right
        .text(total_winchance + "%");

    var labelGroup = g.attr("transform", function (d) {
        var outerRadius = (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
        var centerAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        var rotate = ((centerAngle * 180 / Math.PI) - 90.0);
        if (centerAngle > Math.PI)
            rotate += 180;

        return "translate(" + ( (outerRadius + 10) * Math.sin(((d.endAngle - d.startAngle) / 2) + d.startAngle) ) + "," + ( -1 * (outerRadius + 10) * Math.cos(((d.endAngle - d.startAngle) / 2) + d.startAngle) ) + ")"
            + " rotate(" + rotate + ")";
    })
        .style("text-anchor", function (d) {
            var centerAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            if (centerAngle > Math.PI)
                return "end";
            return "start";
        })
        .attr("dy", ".35em");


    labelGroup.append("text")
        .attr('transform', 'translate(0,-6)')
        .text(function (d) {
            return d.data.name;
        });

    labelGroup.append("text")
        .attr('transform', 'translate(0,6)')
        .text(function (d) {
            return "(" + d.data.score + "%)";
        });


    // Create popup on hover over the skillbars
    $('.aster-popup').popup({
        boundary: '.aster-popup',
        lastResort: true
    });
}