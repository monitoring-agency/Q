$(document).ready(function() {
    $('.multiselect').select2({
        multiple: true
    });
    $('.multiselect').on('select2:opening select2:closing', function (event) {
        var $searchfield = $(this).parent().find(".select2-search__field");
        $searchfield.prop("disabled", true);
    })
});