// Allow multiple selections, remove selected players from the opposite team as well, as no player can be in
// both teams simultaneously
$('.ui.dropdown.playerselect').dropdown({
    allowAdditions: true,
    keyboardShortcuts: false,
    onAdd: function (addedValue) {
        $('.ui.dropdown.playerselect .item').filter("[data-value='" + addedValue + "']").addClass("filtered");
    },
    onRemove: function (removedValue) {
        $('.ui.dropdown.playerselect .item').filter("[data-value='" + removedValue + "']").removeClass("filtered");
    }
});

// Load initial values for the form
$('#addmatch').form({
    keyboardShortcuts: false
});

// Post data to the server on submit, reload the page on a successfully added game
$('#addmatch').form({
    fields: {
        score_a: 'empty',
        score_b: 'empty'
    },
    keyboardShortcuts: false,
    onSuccess: function (event, fields) {
        event.preventDefault();
        $('#addmatch').addClass('loading');
        $.ajax({
            type: 'post',
            url: './match/add',
            data: $('form').serialize(),
            success: function () {
                $('input[name=score_a]').val('');
                $('input[name=score_b]').val('');
                location.reload()
            },
            error: function (xhr, status, error) {
                $('#addmatch').removeClass('loading');
                $('#game-submit-error').html(xhr.responseText)
                $('#game-submit-message').transition('fade in')
            }
        })
    }
})

$('#addmatch').on('keyup keypress', function (e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
        e.preventDefault();
        return false;
    }
});

$('.message .close')
    .on('click', function () {
        $(this)
            .closest('.message')
            .transition('fade')
        ;
    })
;