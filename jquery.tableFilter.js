(function($){
    "use strict";
    $.fn.tableFilter = function(options) {
    
        //default settings
        var settings = $.extend({
            tableID: '#filter-table',
            filterID: '#filter',
            filterCell: '.filter-cell',
            autoFocus: false,
            caseSensitive: false,
            localStoreKey: "tableFilterLD",
            useReg: false,
            noResults: 'no results found',
            columns: null,
        }, options);
        
        //auto focus on filter element if autofocs set to true
        if(settings.autoFocus) {
            $(settings.filterID).focus();
        }

        // clean input data when click
        $(settings.filterID).click(function(){
            $(this).val(""); 
            $(this).trigger('input');
        });

        //get table rows
        var rowCount = $(settings.filterCell).parent().length;
        
        //get tablecolumns by counting td's in forst row unless passed as option
        if(settings.columns === null) {
            settings.columns = $('tr:first td,th', $(settings.tableID)).length;
        }
        
        //use case-sensitive matching unless changed by settings (default)
        var contains = ':contains';
        
        if(!settings.caseSensitive) {
            //create custom "icontains" selector for case insensitive search
            $.expr[':'].icontains = $.expr.createPseudo(function(text) {
                return function(e) {
                    return $(e).text().toUpperCase().indexOf(text.toUpperCase()) >= 0;
                };
            });
            contains = ':icontains';
        }
        
        if(settings.useReg){
            // Use regular expressions for filtering
            $.expr[':'].reg_contains = $.expr.createPseudo(function(text) {
                return function(e) {
                    try{
                        if(settings.caseSensitive) {
                            return $(e).text().match(new RegExp(text));
                        }else{
                            return $(e).text().match(new RegExp(text, 'i'));
                        }
                    }catch(e){
                        return false;
                    }
                };
            });
            contains = ':reg_contains';
        }

        //bind eventListener to filter element
        this.find(settings.filterID).on("input", function() {
            //get value of input
            var filterString = $(this).val();
            localStorage.setItem(settings.localStoreKey, filterString);

            if(filterString == ""){
                $(settings.tableID + " .filter-hidden").removeClass('filter-hidden').show();
                if ($('#noResults') != undefined) { 
                    $('#noResults').remove();
                } 
                return;
            }
        
            var g_find_flag = false;

            //for each cell compare versus filter input
            $(settings.tableID + " tr").each(function(i){ //pass i as iterator
                // process td data
                var find_flag = false;

                if ($(settings.filterCell, $(this)).length < 1){
                    // skip table header
                    find_flag = true;
                }else{
                    $(settings.filterCell, $(this)).each(function(i){
                        if($(this).is(contains + '(' + filterString + ')')) {
                            find_flag = true;
                            g_find_flag = true;
                        }
                    })
                }
                if(find_flag) {
                    //check hidden rows for backspace operation
                    if($(this).is(':hidden')) {
                        $(this).removeClass('filter-hidden').show();
                    }
                } else {
                    $(this).addClass('filter-hidden').hide();
                }
            }); 
            //find rows with 'hidden' class and compare to row count if equal then display 'no results found' message
            if (!g_find_flag) {
                if ($('#noResults').is(':visible')) {
                    return; //do not display multiple "no results" messages
                }
                var newRow = $('<tr id="noResults"><td colspan="' + settings.columns +'"><em>' + settings.noResults + '</em></td></tr>').hide(); //row can be styled with CSS
                $(settings.tableID).append(newRow);
                newRow.show();
            } else if ($('#noResults') != undefined) { 
                $('#noResults').remove();
            } 
        });

        // use local storage to store filter data, for load data when refresh page
        var stored_filter = localStorage.getItem(settings.localStoreKey);
        if(stored_filter){
            $(settings.filterID).val(stored_filter);
            $(settings.filterID).trigger('input');
        }
    };
}(jQuery));
