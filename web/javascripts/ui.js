$(document).ready(function() {


    $('body').append($('<div id="tweets">').tweet({
        avatar_size  : 38,
        count        : 6,
        query        : 'chipkaart',
        loading_text : 'aan het zoeken op twitter...'
    }));


    $('body').append($('<div id="delicious">').delicious({
        username     : 'checkuitcheckin',
        count        : 10,
        loading_text : 'aan het zoeken op delicious...'
    }));


});
