// Allow multiple selections, remove selected players from the opposite team as well, as no player can be in
// both teams simultaneously
$('.ui.dropdown.playerselect').dropdown({
    allowAdditions: true,
    keyboardShortcuts: false,
    allowTab: false,
    onAdd: function (addedValue) {
        $('.ui.dropdown.playerselect .item')
            .filter("[data-value='" + addedValue + "']")
            .filter((n, el) => el.parentElement.parentElement != this)
            .remove();
    },
    onRemove: function (removedValue) {
        var test = $('.ui.dropdown.playerselect .menu')
            .filter((n, el) => el.parentElement != this)
            .append("<div class='item' data-value='" + removedValue + "'>" + removedValue + "</div>");

        // Refresh UI so styles are reapplied
        $('.ui.dropdown.playerselect').dropdown('refresh');
    }
});

// Set tabindex on the search elements manually, as semantic-ui can't be convinced to do it correctly
$('#dropdown-team-a .search').attr('tabindex', '1');
$('#dropdown-team-b .search').attr('tabindex', '4');

// Remove all elements from dropdown which are initially selected in the other dropdown
$('.ui.dropdown.playerselect').each(function (n) {
    var other_selected = $('.ui.dropdown.playerselect')
        .filter((n, el) => el != this)
        .find("a");

    for (let el of other_selected) {
        $('.ui.dropdown.playerselect .item')
            .filter("[data-value='" + el.text + "']")
            .filter((n, el) => el.parentElement.parentElement == this)
            .remove()
    }

    $(this).dropdown('refresh');
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