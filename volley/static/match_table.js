$('.delete-button')
    .on('click', function () {
        $(this).transition('fade out', function () {
            $(this).parent().find('.confirm-delete').transition('fade in');
        });
    })
;


$(document).ready(function () {
    $('#data tbody').paginathing({
        perPage: 10,
        limitPagination: 7,
        insertAfter: '.paginator',
        ulClass: 'ui right floated pagination menu',
        liClass: 'item'
    });
});