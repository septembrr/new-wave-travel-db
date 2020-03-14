function populateEndDate() {
    var date2 = jQuery('#startDate').datepicker('getDate');
    date2.setDate(date2.getDate() + 1);
    jQuery('#endDate').datepicker('setDate', date2);
    jQuery("#endDate").datepicker("option", "minDate", date2);
}

jQuery(document).ready(function() {

    jQuery("#startDate").datepicker({
        dateFormat: "MM/dd/yyyy",
        minDate: 'dateToday',
        onSelect: function(date) {
        populateEndDate();
        }
    }).datepicker("setDate", new Date());
    jQuery('#endDate').datepicker({
        dateFormat: "MM/dd/yyyy",
        minDate: 1,
        onClose: function() {
        var dt1 = jQuery('#startDate').datepicker('getDate');
        var dt2 = jQuery('#endDate').datepicker('getDate');
        if (dt2 <= dt1) {
            var minDate = jQuery('#endDate').datepicker('option', 'minDate');
            jQuery('#endDate').datepicker('setDate', minDate);
        }
        }
    }).datepicker("setDate", new Date());

});