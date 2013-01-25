/**
 * Initialize standard build of the TinyMCE
 *
 * @param options
 */
function initTinyMCE(options) {
    (function ($) {
        if(typeof(options) == 'undefined') {
            throw new Error('No tinyMCE options given!');
        }
        window.defaultTinyMCEOptions = options;
        window.defaultTinyMCEJQuery = jQuery;

        while(true) {
            if(typeof(window.tinyMceIsInit) == 'undefined') {
                var retries = retries || 0;
                retries++;
                if(retries > 100) {
                    throw new Error('Failed to init tinyMCE');
                }
                continue
            }

            $(function () {
                doInitTinyMce(options, jQuery)
            });

            break;
        }

    }(jQuery));
}

function reInitTinyMce() {
    doInitTinyMce(window.defaultTinyMCEOptions, window.defaultTinyMCEJQuery);
}

function doInitTinyMce(options, $) {
    var $tinymceTargets;

    if(options.textarea_class){
        $tinymceTargets = $('textarea' + options.textarea_class);
    } else {
        $tinymceTargets = $('textarea');
    }

    $tinymceTargets.each(function () {
        var $textarea = $(this),
            theme = $textarea.data('theme') || 'simple';

        if('undefined' == typeof($textarea.attr('aria-decorated'))) {

            // Get selected theme options
            var themeOptions = (typeof options.theme[theme] != 'undefined')
                ? options.theme[theme]
                : options.theme['simple'];

            themeOptions.script_url = options.jquery_script_url;

            // workaround for an incompatibility with html5-validation (see: http://git.io/CMKJTw)
            if ($textarea.is('[required]')) {
                themeOptions.oninit = function (editor) {
                    editor.onChange.add(function (ed) {
                        ed.save();
                    });
                };
            }
            themeOptions.setup = function(ed) {
                // Add custom buttons to current editor
                $.each(options.tinymce_buttons || {}, function(id, opts) {
                    opts = $.extend({}, opts, {
                        onclick: function() {
                            var callback = window['tinymce_button_' + id];
                            if (typeof callback == 'function') {
                                callback(ed);
                            } else {
                                alert('You have to create callback function: "tinymce_button_' + id + '"');
                            }
                        }
                    });
                    ed.addButton(id, opts);
                });

                // Load external plugins
                $.each(options.external_plugins || {}, function(id, opts) {
                    var url = opts.url || null;
                    if (url) {
                        tinymce.PluginManager.load(id, url);
                    }
                });
            };

            $textarea.tinymce(themeOptions);
            $textarea.attr('aria-decorated', true);
        }
    });
}