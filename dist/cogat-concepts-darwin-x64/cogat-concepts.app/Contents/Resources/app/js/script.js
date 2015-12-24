// Mixing jQuery and Node.js code in the same file? Yes please!

$(function(){

    // Display some statistics about this computer, using node's os module.

    var os = require('os');
    var prettyBytes = require('pretty-bytes');

    $('.stats').append('Getting reading to throw up concepts...</span>');

    // Electron's UI library.

    var shell = require('shell');


    // Fetch All Cognitive Atlas tasks

    var div = $('.concepts');

    // The same-origin security policy doesn't apply to electron, so we can
    // send ajax request to other sites. Let's fetch Tutorialzine's rss feed:

    $.get('http://cognitiveatlas.org/api/v-alpha/concept', function(response){

        concepts = $.parseJSON(response)
        $.each(concepts, function(idx, concept){

            // Generate link to cognitive atlas
            var link = "http://www.cognitiveatlas.org/concept/id/" + concept.id
 
                // Make an image with the term name
            var src = "https://placeholdit.imgix.net/~text?txtsize=12&bg=1756e8&txtclr=ffffff&txt=" + concept.name.replace(" ","+") + "&w=100&h=50&txttrack=0"
            
                // Create a li item for every article, and append it to the unordered list.
            var li = $('<a href="'+ link +'" target="_blank"><img src="'+ src +'" class="img-responsive" data-highres="'+ src +'" alt="' + concept.name +'"/></a></li>');

            div.append(li);
  
        });

    });

});
