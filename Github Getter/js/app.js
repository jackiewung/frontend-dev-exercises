$(function() {

  //handles submit on form by adding to recently searched and calling github API
  $(document).on("submit", "form", function(e) {
    e.preventDefault();

    var query = $(this).find("#search").val();

    //handles recently searched
    if(recentlySearched && recentlySearched.length > 0) {
      if(recentlySearched.indexOf(query) === -1) {
        recentlySearched.push(query);
        localStorage.setItem("recently", JSON.stringify(recentlySearched));
        var recentlyStoredView = [];

        recentlySearched.map(function(item) {
          recentlyStoredView.push("<div class=recently-searched-item>" + item + "</div>");
        })

        $(".recently-searched-itemlist").html(recentlyStoredView);
      };
    } else {
      var startNewRecent = [query];
      localStorage.setItem("recently", JSON.stringify(startNewRecent));
      recentlyStorage = JSON.parse(localStorage.getItem("recently"));

      $(".recently-searched-itemlist").html(recentlyStorage);
    }

    githubSearch(query);
  });

  //handles github search
  function githubSearch (input) {
    $("#search").val("");
    var checkLocal = JSON.parse(localStorage.getItem(input));

    if(checkLocal) {
      loadLocalStorage(checkLocal);
    } else {
       $.ajax({
        url: "https://api.github.com/legacy/repos/search/" + input,
        dataType: "json",
        beforeSend: function() {
          var thinking = "Thinking";

          $(".divider-content-right").css({ "display": "none" });
          $("#results-container").html("<div class=thinking-cap>" + thinking + "</div>");

          thinkingCap = setInterval(function() {
            thinking = thinking += ".";
            $("#results-container").html("<div class=thinking-cap>" + thinking + "</div>");
          },250);
        }
      }).done(function(data) {
        clearInterval(thinkingCap);
        var repoSearch = data.repositories;
        localStorage.setItem(input, JSON.stringify(repoSearch));
        loadLocalStorage(JSON.parse(localStorage.getItem(input)));
        console.log("done")
      })
    }

    $("#overlay-container").html("<div class=now-searching>searching for..." + "  <i>" + input + "</i></div>");
    $(".divider-content-right").css({ "display": "none" });
    $(".now-searching").css({ "display": "block" });

  };

  //uses local storage information to map and display all of the results from the query
  function loadLocalStorage (itemStorage) {
    var repoBasicInfo = [];
    var repoStorage = [];

    itemStorage.map(function(item, index) {
      var repoView =
        "<div class=repo-box><div class=repo-title>"
            + item.name +
          "</div><div class=repo-owner>"
            + item.owner +
        "</div></div>";

      if(index % 2 === 0) {
        repoView = "<div class=even-index>" + repoView + "</div>";
      }

      repoBasicInfo.push(repoView);
      repoStorage.push(item);
    });

    $("#results-container").html(repoBasicInfo);
    $("#results-container").css({ "display": "block" });
    $(".results-go-back").css({ "display": "block" });
    showRepoInfo(repoStorage);
  };

  //toggles the extra information display for each repo
  function showRepoInfo (data) {
    $("#results-container .repo-box").on("click", function() {
      var index = $(this).index();
      var repoInfo = data[index];

      if(repoInfo.language.length < 1) {
        repoInfo.language = "no language :(";
      };

      var showRepoInfo =
      "<div class=repo-description><a href=" + repoInfo.url + "><button class=repo-button> GITHUB REPO → </button></a><BR><B>FOLLOWERS</B>: " + repoInfo.followers +
        "     <B>LANGUAGE</B>: " + repoInfo.language + "<BR><div class=repo-info>"
        + repoInfo.description + "</div></div>";

      if($(this).has(".repo-description").length) {
        $(this).children(".repo-description").remove();
      } else {
        $(this).append(showRepoInfo);
      }
    })
  };

  //checks if recently searched already exists on page enter so it knows to render if it does
  var recentlySearched = JSON.parse(localStorage.getItem("recently"));

  if(recentlySearched && recentlySearched.length > 0) {
    var recentlyStored = [];
    recentlySearched.map(function(item) {
      recentlyStored.push("<div class=recently-searched-item>" + item + "</div><BR>");
    })
    $(".recently-searched-itemlist").html(recentlyStored);
  };

  //delegates a listener on each recently searched item, if clicked then search github
  $(".recently-searched-itemlist").on("click", ".recently-searched-item", function() {
    var clickedItem = $(this).context.innerHTML;
    githubSearch(clickedItem);
  });

  //back button toggles the view of results and recently searched
  $(".results-go-back").on("click", function() {
    $("#results-container").css({ "display": "none" });
    $(".divider-content-right").css({ "display": "block" });
    $(".results-go-back").css({ "display": "none" });
    $(".now-searching").css({ "display": "none" });
  });

  //clears storage on clicking "x" in recently searched
  $(".recently-searched-list .clear-searched").on("click", function() {
    localStorage.clear();
    $(".recently-searched-itemlist").html("history is cleared! start searching :)");
  });

});