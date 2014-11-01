var opts = {
  lines: 11, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 0.1, // Corner roundness (0..1)
  rotate: 44, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#1FACEF', // #rgb or #rrggbb or array of colors
  speed: 1.4, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '45%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};
var target = document.getElementById('results');
var spinner = new Spinner(opts);

function checkInput()
{
     var mac = $('#phone_mac').val().toUpperCase();
     var dn = $('#phone_realdn').val();
    var autodn = $('#phone_autodn').val();
     var regex = /^([0-9A-F]{2}){6}$/;
     var rDN = /^[1-9]([0-9])*$/;
     isValidDN = rDN.test(dn);
     isValidautoDN = rDN.test(autodn);
     isValidMacAddress = regex.test(mac);
     if (!isValidDN )
     {
         alert("Invalid input")
     }
     else if (isValidMacAddress || isValidautoDN)
     
     {
          spinner.spin(target);
          var parameters = { mac: mac, dn:dn, autodn:autodn };
          $.get( '/changeMAC',parameters, function(data) {
       $('#results').html(data);
        spinner.stop(target);
       })
          .fail(function(data) {
              $('#results').html("Error: Something Seems to be wrong with the Netowrk..."); 
               spinner.stop(target);
          });
         
     }
     else
         {
       alert("Invalid input")
     }
     
}

function search()
{
    var v = $('#search').val();
    if (v.length > 3)
   {
        spinner.spin(target);
        var parameters = { search: $('#search').val() };
       $.get( '/searching',parameters, function(data) {
       $('#results').html(data);
        spinner.stop(target);
     });
   }
}
var timerId;

$(function(){
 $('#search').on('keyup', function(e){
   clearTimeout(timerId);  
   var  stringval = $(this).val();
   if (stringval.length > 3)
   {
      timerId = setTimeout(search, 500)
   }
   else 
   if(e.keyCode === 13) {
        spinner.spin(target);
       var parameters = { search: $(this).val() };
       $.get( '/searching',parameters, function(data) {
       $('#results').html(data);
            spinner.stop(target);
     });
    };
 });
});
