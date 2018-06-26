$('.delete-button')
    .on('click', function () {
        $(this).transition('fade out', function () {
            $(this).parent().find('.confirm-delete').transition('fade in');
        });
    })
;

$(document).ready(function () {
    var rowsShown = 10;
    var rowsTotal = $('#data tbody tr').length;
    var numPages = rowsTotal / rowsShown;
    for (i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#t-next').before('<a href="#/" class="item num" rel="' + i + '">' + pageNum + '</a> ');
    }
    $('#data tbody tr').hide();
    $('#data tbody tr').slice(0, rowsShown).show();
    $('.ui.right.floated.pagination.menu a.num:first').addClass('active');
    $('.ui.right.floated.pagination.menu a.num').bind('click', function () {

        $('.ui.right.floated.pagination.menu a.num').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $('.ui.right.floated.pagination.menu a.icon').attr('rel', currPage);
        $('#data tbody tr').css('opacity', '0.0').hide().slice(startItem, endItem).css('display', 'table-row').animate({opacity: 1}, 300);
    });

    $('.ui.right.floated.pagination.menu a.icon').bind('click', function () {
        var currPage = Number($(this).attr('rel'));
        var newPage;
        if ($(this).attr('id') == 't-next') {
            newPage = (currPage + 1).toString();
        } else {
            newPage = (currPage - 1).toString();
        }

        var b = $('.ui.right.floated.pagination.menu a.num[rel="' + newPage + '"]');
        if (b.length > 0) {
            $('.ui.right.floated.pagination.menu a.icon').attr('rel', newPage);
            b.trigger('click');
        }
    });
});