function loadData (itemStorage) {
  var repoStorage = [];
  itemStorage.map(function(item) {
    var repoView = "<h1>" + item.name + "</h1><BR>" + item.owner;
    repoStorage.push(repoView);
  })
  $("#results-container").html(repoStorage);
};

$(function() {

  $(document).on("submit", "form", function(e) {
    e.preventDefault();

    var query = $(this).find("#search").val();
    var checkLocal = JSON.parse(localStorage.getItem(query));

    if(checkLocal) {
      console.log("inside", checkLocal)
      loadData(checkLocal);
    } else {
       $.ajax({
        url: "https://api.github.com/legacy/repos/search/" + query,
        dataType: "json"
      }).done(function(data) {
        var repos = data.repositories;
        localStorage.setItem(query, JSON.stringify(repos));
        loadData(JSON.parse(localStorage.getItem(query)));
      });
    }
  })

});