function addSnackbar(msg, className, timeout) {
    var snackbar = $('<div class="snackbar ' + className + '">' + msg + '</div>');
    $('#snackbar-container').append(snackbar);
    setTimeout(function () {
        snackbar.remove();
    }, timeout || 3000);
}