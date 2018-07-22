function make_axes(svg, xAxis, yAxis, chartHeight) {
    let axes = svg.append('g')
        .attr('clip-path', 'url(#axes-clip)');

    axes.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);

    axes.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .attr('x', -2)
        .style('text-anchor', 'end')
        .text('Skill');
}

function make_graph(svg, data, x, y) {
    let upperInnerArea = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(d.index) || 1;
        })
        .y0(function (d) {
            return y(d.confidence_upper);
        })
        .y1(function (d) {
            return y(d.skill);
        });

    let medianLine = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(d.index);
        })
        .y(function (d) {
            return y(d.skill);
        });

    let lowerInnerArea = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(d.index) || 1;
        })
        .y0(function (d) {
            return y(d.skill);
        })
        .y1(function (d) {
            return y(d.confidence_lower);
        });

    svg.datum(data);

    svg.append('path')
        .attr('class', 'area upper inner')
        .attr('d', upperInnerArea)
        .attr('clip-path', 'url(#rect-clip)');

    svg.append('path')
        .attr('class', 'area lower inner')
        .attr('d', lowerInnerArea)
        .attr('clip-path', 'url(#rect-clip)');

    svg.append('path')
        .attr('class', 'skill-line')
        .attr('d', medianLine)
        .attr('clip-path', 'url(#rect-clip)');

    svg.selectAll('circle').data(data)
        .enter()
        .append('circle')
        .attr('cx', function (d) {
            return x(d.index)
        })
        .attr('cy', function (d) {
            return y(d.skill)
        })
        .classed('match-indicator', true)
        .classed('game-won', function (d) {
            return d.win === 1
        })
        .attr('r', 5)
        .attr('clip-path', 'url(#rect-clip)')
        .attr('data-html', function (d) {
            color = "green";
            sign = "+";
            if (d.rating_change < 0.0) {
                color = "red";
                sign = "";
            }

            return '<div class="header">' + d.date + '</div>'
                   + '<div class="content">Rating: <span style="color:' + color + '">'+ sign + d.rating_change.toPrecision(2) +'</span></div>';
        });
}

function run_transition(chartWidth, rectClip) {
    rectClip.transition()
        .duration(1000)
        .attr('width', chartWidth + 10);
}

function skillgraph(anchor, data, svgWidth = 1100, svgHeight = 200) {
    let margin = {top: 20, right: 20, bottom: 40, left: 40},
        chartWidth = svgWidth - margin.left - margin.right,
        chartHeight = svgHeight - margin.top - margin.bottom;

    // Scales for x (game number) and y (skill) axis
    let x = d3.scaleLinear().range([0, chartWidth])
            .domain(d3.extent(data, function (d) {
                return d.index;
            })),
        y = d3.scaleLinear().range([chartHeight, 0])
            .domain(
                [d3.min(data, function (d) {
                    return d.confidence_lower - 1;
                }), d3.max(data, function (d) {
                    return d.confidence_upper + 1;
                })]
            );

    let xAxis = d3.axisBottom(x)
            .tickSizeInner(-chartHeight).tickSizeOuter(0).tickPadding(10),
        yAxis = d3.axisLeft(y)
            .tickSizeInner(-chartWidth).tickSizeOuter(0).tickPadding(10);

    let svg = d3.select(anchor).append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // clipping for animation
    let rectClip = svg.append('clipPath')
        .attr('id', 'rect-clip')
        .append('rect')
        .attr('width', 0)
        .attr('height', chartHeight);

    make_axes(svg, xAxis, yAxis, chartHeight);
    make_graph(svg, data, x, y);
    run_transition(chartWidth, rectClip);

    // Create popup on hover over the skillbars
    $('.match-indicator').popup({
        hoverable: true
    });
}