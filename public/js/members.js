$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(function(data) {
    $(".member-name").text(data.email);
    $("#balance").text("loading balance");
    var token = data.token;
    $.post("/accounts/balance/get", { token: token }).then(function(res) {
      $("#balance").text(res);
    });
  });
});
