/***********************************************************************

    Check in, check uit

    Copyright 2010, Martijn Vermaat <martijn@vermaat.name>

      http://checkincheckuit.nl
      http://svn.vermaat.name/checkincheckuit

    Licensed under the MIT license, see the LICENSE file

      http://en.wikipedia.org/wiki/Mit_license

    Some of the Twitter handling code was adapted from the jQuery
    plugin Tweet!, found at http://tweet.seaofclouds.com/

    This code uses:
      jQuery          http://jquery.com
      jQuery Timers   http://plugins.jquery.com/project/timers

***********************************************************************/


$(document).ready(function() {


    var twitterSearch = 'chipkaart';
    var twitterCount = 20;
    var twitterDisplayTime = 1000 * 8;
    var twitterFadeTime = 800;
    /*
      There seems to be a bug, where animations are not smooth when the
      interval is specified as a string, e.g. '5s'.
    */
    var twitterReloadTime = 1000 * 60 * 5;

    var deliciousUser = 'checkuitcheckin';
    var deliciousTag = 'nieuws';
    var deliciousCount = 10;


    var twitterUrl = 'http://search.twitter.com/search?&q='
        + encodeURIComponent(twitterSearch);
    var twitterApiUrl = 'http://search.twitter.com/search.json?&q='
        + encodeURIComponent(twitterSearch)
        + '&rpp=' + twitterCount + '&callback=?';
    var initialTweet = true;
    var tweets = [];
    var currentTweet = 0;

    var deliciousUrl = 'http://delicious.com/' + deliciousUser
        + '/' + deliciousTag;
    var deliciousApiUrl = 'http://feeds.delicious.com/v2/json/'
        + deliciousUser + '/' + deliciousTag
        + '?count=' + deliciousCount + '&callback=?';


    // Load Twitter search results and call callback function
    function updateTwitter(callback) {

        // http://apiwiki.twitter.com/Return-Values

        $.getJSON(twitterApiUrl, function(data) {

            $.each((data.results || data), function(i, tweet) {
                var user = tweet.from_user || tweet.user.screen_name;
                tweets.push({
                    text    : twittify(tweet.text),
                    user    : user,
                    date    : relativeTime(tweet.created_at),
                    url     : 'http://twitter.com/' + user
                              + '/statuses/' + tweet.id,
                    userUrl : 'http://twitter.com/' + user,
                });
            });

            currentTweet = 0;
            if (callback) callback();

        });

    }


    // Load Delicious links and show them on the page
    function updateDelicious() {

        // http://delicious.com/help/feeds

        $.getJSON(deliciousApiUrl, function(data) {
            var list = $('<dl>').appendTo($('#delicious'));
            $.each((data.results || data), function(i, item) {
                list.append($('<dt>').text(shortDate(item.dt)));
                list.append($('<dd>').append(
                    $('<a>').attr('href', item.u).text(item.d)));
            });
            $('#delicious').append($('<p>').append(
                $('<a>Meer nieuwsberichten...</a>').attr('href', deliciousUrl)));
        });

    }


    // Advance to the next twee
    function showNextTweet() {
        if (tweets.length < 1) return;
        currentTweet = (currentTweet + 1) % tweets.length;
        showTweet();
    }


    // Like the function above, with a minor difference
    function showPreviousTweet() {
        if (tweets.length < 1) return;
        currentTweet = (tweets.length + currentTweet - 1) % tweets.length;
        showTweet();
    }


    /*
      Show the current tweet on the page. If this is the first twee we show,
      do just that. Otherwise fadeout the old tweet and fadein the new.
    */
    function showTweet() {

        var show = function() {
            var tweet = tweets[currentTweet];
            var pane = $('#content .tweet');
            /*
              The documentation (and experience) tells us we get the tweet
              text 'escaped and HTML encoded'.
              I still don't like to .html() this into the page, but being more
              cautious would make twittify() much more involved.

              http://apiwiki.twitter.com/Return-Values
            */
            pane.find('.text').html(tweet.text);
            pane.find('h2').empty().append(
                $('<a>').attr('href', tweet.userUrl).text('@' + tweet.user));
            pane.find('h2').append(
                $('<a>').attr('href', tweet.url).text(tweet.date).addClass(
                    'date'));
        }

        if (initialTweet)
            show();
        else
            $("#content .tweet").fadeOut(twitterFadeTime, function () {
                show();
                $("#content .tweet").fadeIn(twitterFadeTime);
            });

        initialTweet = false;

    }


    // Setup the Twitter stream
    function setupTwitter() {

        // Get tweets, show the first one, and skip to next tweet every 5 seconds
        updateTwitter(function() {

            if (tweets.length > 0)
                showTweet();

            if (tweets.length > 1) {

                $(document).everyTime(twitterDisplayTime, showNextTweet);

                // We add navigation links and reset the skip timer on click
                $('#content').append($('<ul class="nav">').append(
                    $('<li title="vorige">&lt;</li>').click(function() {
                        showPreviousTweet();
                        $(document).stopTime();
                        $(document).everyTime(twitterDisplayTime, showNextTweet);
                    })
                ).append(
                    $('<li title="volgende">&gt;</li>').click(function() {
                        showNextTweet();
                        $(document).stopTime();
                        $(document).everyTime(twitterDisplayTime, showNextTweet);
                    })
                ));

            }

        });


        // Every 5 minutes, get tweets and start at the latest tweet again
        $(document).everyTime(twitterReloadTime, updateTwitter);

        // Show link to Twitter search results
        $('#content').append($('<p class="more">').append(
            $('<a>meer...</a>').attr('href', twitterUrl)));

        // Pause auto advancing of tweets on mouse hover
        $('#content .tweet').hover(function() {
            $(document).stopTime();
        }, function() {
            if (tweets.length > 1) {
                showNextTweet();
                $(document).everyTime(twitterDisplayTime, showNextTweet);
            }
        });

    }


    // Show current date
    $('.now').text(shortDate());

    // Show Delicious links
    updateDelicious();

    // If this is the index page, setup the Twitter stream
    if ($('body').hasClass('index'))
        setupTwitter();


});


// Create links for urls, users, and hashtags
function twittify(tweet) {

    var linkUrl = function(s) {
        var returning = [];
        var regexp = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
        return s.replace(regexp,"<a href=\"$1\">$1</a>");
    }

    var linkUser = function(s) {
        var returning = [];
        var regexp = /[\@]+([A-Za-z0-9-_]+)/gi;
        return s.replace(regexp,"<a href=\"http://twitter.com/$1\">@$1</a>");
    }

    var linkHash = function(s) {
        var returning = [];
        var regexp = / [\#]+([A-Za-z0-9-_]+)/gi;
        return s.replace(regexp, ' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all">#$1</a>');
    }

    return linkHash(linkUser(linkUrl(tweet)));

}


/*
  The non-search twitter APIs return inconsistently-formatted dates, which
  Date.parse cannot handle in IE. We therefore perform the following
  transformation:

  Wed Apr 29 08:53:31 +0000 2009
  =>
  Wed, Apr 29 2009 08:53:31 +0000
*/
function parseDate(s) {
    return Date.parse(s.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i,
                                '$1,$2$4$3'));
}


// Turn a date/time string into a relative time
function relativeTime(time) {

    var parsedDate = parseDate(time);
    var relativeTo = (arguments.length > 1) ? arguments[1] : new Date();
    var delta = parseInt((relativeTo.getTime() - parsedDate) / 1000);

    var pluralize = function(singular, n) {
        var plurals = {
            'minuut' : 'minuten',
            'uur'    : 'uur',
            'dag'    : 'dagen'
        };
        return '' + n + ' ' + (n == 1 ? singular : plurals[singular]);
    };

    if (delta < 60)
        return 'seconden geleden';
    else if (delta < (60 * 60))
        return pluralize('minuut', parseInt(delta / 60)) + ' geleden';
    else if (delta < (24 * 60 * 60))
        return pluralize('uur', parseInt(delta / 3600)) + ' geleden';
    else
        return pluralize('dag', parseInt(delta / 86400)) + ' geleden';

}


// Create a short description from a date string
function shortDate(s) {

    var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
                  'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

    if (!s)
        return (new Date).getDate() + ' ' + months[(new Date).getMonth() + 1];

    var d = s.match(/^\d{4}-(\d{2})-(\d{2}).*$/);
    if (d != null)
        return d[2] + ' ' + months[parseInt(d[1]) - 1];

    return '';

}
