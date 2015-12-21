$(function() {

  //handles submit on form by adding to recently searched and calls github API
  $(document).on("submit", "form", function(e) {
    e.preventDefault();

    var query = $(this).find("#search").val();

    //handles error if there's no input
    if(query.length === 0) {
      if(!$(".error").is(":visible")) {
        $(".main-form").after("<div class=error>Oops! Please write an input</div>");
      }
      return;
    }

    //handles recently searched
    var recentlySearched = JSON.parse(localStorage.getItem("recently") || '[]');

    if(recentlySearched && recentlySearched.length > 0) {
      if(recentlySearched.indexOf(query) === -1) {
        recentlySearched.push(query);
        localStorage.setItem("recently", JSON.stringify(recentlySearched));

        var recentlyStoredView = [];

        recentlySearched.map(function(item) {
          recentlyStoredView.push("<div class=recently-searched-item>" + item + "</div>");
        });

        $(".recently-searched-itemlist").html(recentlyStoredView);
      };
    } else {
      //if there is no recently searched, on first search it creates it in local storage
      var startNewRecent = [query];
      localStorage.setItem("recently", JSON.stringify(startNewRecent));

      recentlyStorage = JSON.parse(localStorage.getItem("recently"));
      $(".recently-searched-itemlist").html("<div class=recently-searched-item>" + recentlyStorage + "</div>");
    }

    githubSearch(query);
  });

  //handles github search
  function githubSearch (input) {
    $("#search").val("");

    var checkLocal = JSON.parse(localStorage.getItem(input));

    //checkLocal pulls from local storage if the search has been made before
    if(checkLocal) {
      if(checkLocal.length) {
        loadLocalStorage(checkLocal);
      } else {
        noResults();
      }
    } else {
       $.ajax({
        url: "https://api.github.com/legacy/repos/search/" + input,
        dataType: "json",
        beforeSend: function() {
          var thinking = "Thinking";
          var time = 0;

          $("#results-container").html("<div class=thinking-cap>" + thinking + "</div>");

          thinkingCap = setInterval(function() {
            if(time > 1200) {
              clearInterval(thinkingCap);
              $("#results-container").html("<div class=thinking-cap>please try again!</div>");
              $(".results-go-back").css({ "display": "block" });
              return;
            } else {
              time += 200;
            }

            thinking = thinking += ".";
            $("#results-container").html("<div class=thinking-cap>" + thinking + "</div>");
          },200);
        }
      }).done(function(data) {
        clearInterval(thinkingCap);
        localStorage.setItem(input, JSON.stringify(data.repositories));

        if(data.repositories.length > 0) {
          loadLocalStorage(JSON.parse(localStorage.getItem(input)));
        } else {
          noResults();
        }
      })
    };

    //attaches a now searching text on the left panel
    $("#overlay-container").html("<div class=now-searching>searching for..." + "  <i>" + input.toUpperCase() + "</i></div>");
    $(".divider-content-right").css({ "display": "none" });
    $(".now-searching").css({ "display": "block" });
  };

  //uses local storage information to map and display all of the results from the query
  function loadLocalStorage (itemStorage) {
    //repoStorage is the entire data while repoBasicInfo holds the html of title and user
    var repoBasicInfo = [];
    var repoStorage = [];

    itemStorage.map(function(item, index) {
      var repoView =
        "<div class=repo-box><div class=repo-title>"
            + item.name +
          "</div><div class=repo-owner>"
            + item.owner +
        "</div></div>";

      //every other result has a different background color added to it
      if(index % 2 === 0) {
        repoView = "<div class=even-index>" + repoView + "</div>";
      };

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

      //checks if language exists, if it doesn't have a filler
      if(repoInfo.language.length < 1) {
        repoInfo.language = "no language :(";
      };

      var showRepoInfo = "<div class=repo-description><a href=" + repoInfo.url + " target=_blank><button class=repo-button> GITHUB REPO → </button></a><BR><B>FOLLOWERS</B>: " + repoInfo.followers +
        " <B>LANGUAGE</B>: " + repoInfo.language + "<BR><div class=repo-info>"
        + repoInfo.description + "</div></div>";

      //toggles description view on and off by checking to see if the parent has the child repo-description
      if($(this).has(".repo-description").length) {
        $(this).children(".repo-description").remove();
      } else {
        $(this).append(showRepoInfo);
      }
    })
  };

  //displays no results
  function noResults () {
    $("#results-container").css({ "display": "block" });
    $("#results-container").html("<div class=thinking-cap>No Results</div>");
    $(".results-go-back").css({ "display": "block" });
  };

  //checks if recently searched already exists on page enter so it knows to render if it does
  var recentlySearched = JSON.parse(localStorage.getItem("recently") || '[]');

  if(recentlySearched && recentlySearched.length > 0) {
    var recentlyStored = [];

    recentlySearched.map(function(item) {
      recentlyStored.push("<div class=recently-searched-item>" + item + "</div>");
    });

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
    $(".recently-searched-list").css({ "display": "block" });
    $(".results-go-back").css({ "display": "none" });
    $(".now-searching").css({ "display": "none" });
  });

  //clears storage on clicking "x" in recently searched
  $(".recently-searched-list .clear-searched").on("click", function() {
    localStorage.removeItem('recently');
    $(".recently-searched-itemlist").html("history is cleared! start searching :)");
  });

  //removes error message on key change
  $("#search").on("change", function() {
    var searchVal = $("#search").val();

    if(searchVal.length) {
      $(".error").hide();
    }
  });

});