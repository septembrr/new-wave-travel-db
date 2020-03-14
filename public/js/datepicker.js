function populateEndDate() {
    var date = jQuery('#startDate').datepicker("getDate");
    date.setDate(date.getDate() + 1);
    jQuery('#endDate').datepicker('setDate', date);
    jQuery("#endDate").datepicker("option", "minDate", date);
}

jQuery(document).ready(function() {

    jQuery("#startDate").datepicker({
        dateFormat: "yy-mm-dd",
        minDate: 'dateToday',
        onSelect: function(date) {
            populateEndDate();
        }
    });

    jQuery('#endDate').datepicker({
        dateFormat: "yy-mm-dd",
        minDate: 1,
        onClose: function() {
            var dt1 = jQuery('#startDate').datepicker('getDate');
            var dt2 = jQuery('#endDate').datepicker('getDate');
            if (dt2 <= dt1) {
                var minDate = jQuery('#endDate').datepicker('option', 'minDate');
                jQuery('#endDate').datepicker('setDate', minDate);
            }
        }
    });

});