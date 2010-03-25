(function($) {

    $.fn.delicious = function(o){

        var s = {
            username     : 'checkuitcheckin',
            count        : 5,
        };

        if (o) $.extend(s, o);

        return this.each(function(){

            var list = $('<ul>').appendTo(this);

            if (s.loading_text) $(this).append(loading);

            $.getJSON('http://feeds.delicious.com/v2/json/' + s.username + '?count=' + s.count + '&callback=?', function (data) {
                $.each((data.results || data), function(i, item) {
                    list.append($('<li>').append($('<a>').attr('href', item.u).text(item.d)));
                });
                list.children('li:first').addClass('first');
                list.children('li:last').addClass('last');
                list.children('li:odd').addClass('even');
                list.children('li:even').addClass('odd');
            });

        });

    };

})(jQuery);
