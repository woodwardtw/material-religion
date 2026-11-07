(function($) {

    function fixIframeAspect() {
        $('iframe').each(function () {
            var aspect = $(this).attr('height') / $(this).attr('width');
            $(this).height($(this).width() * aspect);
        });
    }

    function framerateCallback(callback) {
        var waiting = false;
        callback = callback.bind(this);
        return function () {
            if (!waiting) {
                waiting = true;
                window.requestAnimationFrame(function () {
                    callback();
                    waiting = false;
                });
            }
        }
    }


    $(document).ready(function() {
        var navElement = $('header nav');
        var expandString = Omeka.jsTranslate('Expand');
        var collapseString = Omeka.jsTranslate('Collapse');

        var closeChildNav = function(parentLi) {
            var childToggle = parentLi.find('.child-toggle').first();
            var childMenu = parentLi.find('ul').first();
            childMenu.removeClass('open');
            childToggle.removeClass('open');
            childToggle.attr('aria-label', expandString).attr('aria-expanded', "false");
        };

        var openChildNav = function(parentLi) {
            var childToggle = parentLi.find('.child-toggle').first();
            var childMenu = parentLi.find('ul').first();
            childMenu.addClass('open');
            childToggle.addClass('open');
            childToggle.attr('aria-label', collapseString).attr('aria-expanded', "true");
        };

        navElement.on('click', '#mobile-nav-toggle', function() {
            navElement.toggleClass('open');
            if (navElement.hasClass('open')) {
                $(this).attr('aria-expanded', "true");
            } else {
                $(this).attr('aria-expanded', "false");
            }
        });
        
        navElement.find('ul ul').each(function(){
          var childMenu = $(this);
          var parentItem = childMenu.parent('li');
          var toggleButton = $('<button type="button" class="child-toggle" aria-expanded="false"></button>');
          toggleButton.attr('aria-label', expandString);
          parentItem.addClass('parent');
          parentItem.children('a').first().wrap('<div class="parent-link"></div>');
          parentItem.find('.parent-link').append(toggleButton);
        });
        
        navElement.on('click', '.child-toggle', function() {
          var parentLi = $(this).parents('.parent').first();
          if ($(this).hasClass('open')) {
            closeChildNav(parentLi);
          } else {
            openChildNav(parentLi);
          }
        });

        navElement.on('keydown', '.child-toggle, .open a', function(e) {
            var parentLi = $(this).parents('.parent');
            var childToggle = parentLi.find('.child-toggle').first();
            if (e.keyCode == '27') {
                closeChildNav(parentLi);
                childToggle.focus();
            }
        });

        navElement.on('mouseenter', '.parent', function() {            
            openChildNav($(this));
        });

        navElement.on('mouseleave', '.parent', function() {            
            closeChildNav($(this));
        });

        navElement.on('mouseleave', '.child-toggle', function() {            
            var parentLi = $(this).parents('.parent').first();
            closeChildNav(parentLi);
        });

        navElement.on('keydown', '.open li:last-child > a:only-child', function(e) {
            var currentLink = $(this);
            var parentBranch = currentLink.parents('.navigation > .parent');
            var lastBranchLink = parentBranch.find('a').last();
            if ((currentLink.is(lastBranchLink)) && (e.keyCode == "9") && !e.shiftKey) {
                e.preventDefault();
                var parentLi = currentLink.parents('.parent').last();
                var nextParentLi = parentLi.next().find('a').first();
                if (nextParentLi.length > 0) {
                    nextParentLi.focus();
                } else {
                    $('#search-toggle').focus();
                }
                closeChildNav(parentLi);
            }
        });

        navElement.on('keydown', '.navigation > .parent > .parent-link > a', function(e) {
            if ((e.keyCode == "9") && e.shiftKey) {
                var parentLi = $(this).parents('.parent').first();
                closeChildNav(parentLi);
            }
        });
        
        // Header search overlay
        var searchToggle = $('#search-toggle');
        var searchOverlay = $('#search-overlay');
        var searchInput = searchOverlay.find('#fulltext-search');

        var openSearch = function() {
            searchOverlay.prop('hidden', false);
            searchToggle.attr('aria-expanded', 'true');
            $('body').addClass('search-open');
            var input = searchInput.get(0);
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
        };

        var closeSearch = function() {
            if (searchOverlay.prop('hidden')) {
                return;
            }
            searchOverlay.prop('hidden', true);
            searchToggle.attr('aria-expanded', 'false');
            $('body').removeClass('search-open');
            searchToggle.focus();
        };

        searchToggle.on('click', openSearch);
        $('#search-close').on('click', closeSearch);

        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });

        // Click outside the overlay closes it
        $(document).on('mousedown', function(e) {
            if (!searchOverlay.prop('hidden')
                && !$(e.target).closest('#search-overlay, #search-toggle').length) {
                closeSearch();
            }
        });

        // Keep keyboard focus inside the overlay while it is open
        searchOverlay.on('keydown', function(e) {
            if (e.key !== 'Tab') {
                return;
            }
            var focusable = searchOverlay.find('input, #search-close');
            var first = focusable.first().get(0);
            var last = focusable.last().get(0);
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        // Maintain iframe aspect ratios
        $(window).on('load resize', framerateCallback(fixIframeAspect));
        fixIframeAspect();
    });
})(jQuery);
