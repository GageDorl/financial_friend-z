$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(function(data) {
    $(".member-name").text(data.name);
    $("#balance").text("loading balance");
    var token = data.token;
    $.post("/accounts/balance/get", { token: token }).then(function(res) {
      $("#balance").text(res);
    });
    $.post("/transaction/get", { token: token }).then(function(res){
      for (i in res) {
        var newTrans = $("<div>");
        newTrans.addClass("transact");
        newTrans.append(
          $("<div class=transName transID=" + i + ">" + res[i].name + "</div>")
        );
        newTrans.append(
          $("<div class=transDate transID=" + i + ">" + res[i].date + "</div>")
        );
        newTrans.append(
          $(
            "<div class=transAmount transID=" +
              i +
              ">" +
              res[i].amount +
              "</div>"
          )
        );
        $("#transactions").append(newTrans);
      }
    });
  });
});
