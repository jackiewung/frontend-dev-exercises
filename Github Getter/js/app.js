$(function() {

  //handles submit on form and searches github repos
  $(document).on("submit", "form", function(e) {
    e.preventDefault();

    var query = $(this).find("#search").val();
    var checkLocal = JSON.parse(localStorage.getItem(query));

    if(checkLocal) {
      loadLocalStorage(checkLocal);
    } else {
       $.ajax({
        url: "https://api.github.com/legacy/repos/search/" + query,
        dataType: "json",
        beforeSend: function() {
          $("#results-container").html("loading!")
        }
      }).done(function(data) {
        var repoSearch = data.repositories;
        localStorage.setItem(query, JSON.stringify(repoSearch));
        loadLocalStorage(JSON.parse(localStorage.getItem(query)));
      });
    }
  });

  //uses local storage information to map and display all of the results from the query
  function loadLocalStorage (itemStorage) {
    var repoBasicInfo = [];
    var repoStorage = [];

    itemStorage.map(function(item) {
      var repoView = "<h1>" + item.name + " | " + item.owner + "</h1>" ;
      repoBasicInfo.push(repoView);
      repoStorage.push(item);
    });

    $("#results-container").html(repoBasicInfo);
    showRepoInfo(repoStorage);
  };

  //toggles the extra information display for each repo
  function showRepoInfo (data) {
    $("#results-container h1").on("click", function() {
      var index = $(this).index();
      var repoInfo = data[index];
      var showRepoInfo = "<div class=repo-description>" + repoInfo.description + "<BR>" + repoInfo.followers + "<BR>" + repoInfo.url + "<BR>" + repoInfo.language + "</div>";

      if($(this).has(".repo-description").length) {
        $(this).children(".repo-description").remove();
      } else {
        $(this).append(showRepoInfo);
      }
    })
  };

});