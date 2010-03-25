$(document).ready(function() {

    var tweets = [];
    var currentTweet = 0;

    $.getJSON('http://search.twitter.com/search.json?&q=chipkaart&rpp=20&callback=?', function(data) {
        $.each((data.results || data), function(i, item) {
            var user = item.from_user || item.user.screen_name;
            tweets.push({
                user : user,
                date : relative_time(item.created_at),
                url  : 'http://twitter.com/' + user + '/statuses/' + item.id,
                text : item.text //linkHash(linkUser(linkUrl(item.text)))
            });
        });
        if (tweets.length > 0) showTweet();
    });

    function nextTweet() {
        if (tweets.length < 1) return;
        currentTweet = (currentTweet + 1) % tweets.length;
        $("#content .tweet").fadeOut(1000, function () {
            showTweet();
            $("#content .tweet").fadeIn(1000);
        });
    }

    function showTweet() {
        var tweet = tweets[currentTweet];
        $('#content .tweet .text').text(tweet.text);
        $('#content .tweet h2').text('@' + tweet.user);
        $('#content .tweet h2').append('<span>' + tweet.date + '</span>');
    }

    $("#content .tweet .text").click(nextTweet);

    $('#delicious').delicious({
        username     : 'checkuitcheckin',
        count        : 6,
    });

});


function linkUrl(s) {
    var returning = [];
    var regexp = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
    return s.replace(regexp,"<a href=\"$1\">$1</a>");
}

function linkUser(s) {
    var returning = [];
    var regexp = /[\@]+([A-Za-z0-9-_]+)/gi;
    return s.replace(regexp,"<a href=\"http://twitter.com/$1\">@$1</a>");
}

function linkHash(s) {
    var returning = [];
    var regexp = / [\#]+([A-Za-z0-9-_]+)/gi;
    return s.replace(regexp, ' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all">#$1</a>');
}

function parse_date(date_str) {
    // The non-search twitter APIs return inconsistently-formatted dates, which Date.parse
    // cannot handle in IE. We therefore perform the following transformation:
    // "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 +0000"
    return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
}

function relative_time(time_value) {
    var parsed_date = parse_date(time_value);
    var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
    var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
    var pluralize = function (singular, n) {
        var plurals = {
            'minuut' : 'minuten',
            'uur'    : 'uur',
            'dag'    : 'dagen'
        };
        return '' + n + ' ' + (n == 1 ? singular : plurals[singular]);
    };
    if(delta < 60) {
        return 'seconden geleden';
    } else if(delta < (60*60)) {
        return pluralize("minuut", parseInt(delta / 60)) + ' geleden';
    } else if(delta < (24*60*60)) {
        return pluralize("uur", parseInt(delta / 3600)) + ' geleden';
    } else {
        return pluralize("dag", parseInt(delta / 86400)) + ' geleden';
    }
}
