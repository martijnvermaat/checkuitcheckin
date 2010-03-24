(function($) {

    $.fn.delicious = function(o){

        var s = {
            username     : null,
            count        : 5,
            loading_text : null
        };

        if (o) $.extend(s, o);

        return this.each(function(){

            var list = $('<ul>').appendTo(this);
            var loading = $('<p class="loading">' + s.loading_text + '</p>');

            if (s.loading_text) $(this).append(loading);

            $.getJSON('http://feeds.delicious.com/v2/json/checkuitcheckin?count=' + s.count + '&callback=?', function (data) {
                if (s.loading_text) loading.remove();
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
