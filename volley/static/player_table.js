// ======== Sorting ========
$('#player-table').tablesort();

$('thead th.num').data('sortBy', function (th, td, tablesort) {
    return Number(td.text());
});

$('#player-table th')
    .popup();

// ======== Confidence bars =========
const confidence_level = 2;
const width = 100;
const height = 10;

// Collect data from table
var data = $('#player-table tbody tr').map(function (i, e) {
    return {
        sigma: Number($(e).find('.confidence').text()),
        mu: Number($(e).find('.skill').text())
    }
});

let domain_min = d3.min(data, function (d, i) {
    return d.mu - confidence_level * d.sigma;
});
let domain_max = d3.max(data, function (d, i) {
    return d.mu + confidence_level * d.sigma;
});

var x_scale = d3.scaleLinear()
    .domain([domain_min, domain_max])
    .range([2, width - 2]);

function error_bars(selection) {
    let lb = function (d, i) {
        return x_scale(d.mu - confidence_level * d.sigma);
    };
    let ub = function (d, i) {
        return x_scale(d.mu + confidence_level * d.sigma);
    };


    selection = selection.append('g')
        .on('mouseover', function (d, i) {
            d3.selectAll('.skillgraph svg g')
                .append('rect')
                .attr('x', lb(d, i))
                .attr('y', 0)
                .attr('width', ub(d, i) - lb(d, i))
                .attr('height', height)
                .classed('highlight-overlay', true);
        })
        .on('mouseout', function (d, i) {
            d3.selectAll('.highlight-overlay').remove();
        });


    selection.append('line')
        .attr('y1', height / 2)
        .attr('y2', height / 2)
        .attr('x1', lb)
        .attr('x2', ub);
    selection.append('line')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('x1', lb)
        .attr('x2', lb);
    selection.append('line')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('x1', ub)
        .attr('x2', ub);
    selection.append('circle')
        .attr('r', 4)
        .attr('cy', height / 2)
        .attr('cx', function (d, i) {
            return x_scale(d.mu);
        });
}


var svgs = d3.selectAll('.skillgraph')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

svgs.each(function (svg, index) {
    d3.select(this).selectAll('g')
        .data([data[index]])
        .enter()
        .call(error_bars);

});
