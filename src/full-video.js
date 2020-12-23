/*! full-video 0.2 | github.com/adamaveray/full-video | MIT */
(function($) {
    if (!window.ActiveXObject && 'ActiveXObject' in window) {
        // Unsupported
        $.fn.fullVideo = function() {};
        return;
    }

    function parseRatio(str) {
        var parts = String(str).split(':');
        if (parts.length !== 2) {
            throw 'Invalid ratio';
        }
        var width = parseInt(parts[0]);
        var height = parseInt(parts[1]);
        if (width == null || isNaN(width) || height == null || isNaN(height)) {
            throw 'Invalid ratio';
        }
        return height / width;
    }

    function FullVideo($el, options) {
        this._init($el, $.extend({}, FullVideo.defaults, options));
    }

    $.extend(FullVideo, {
        defaults: {
            classLoading: '__loading',
            classLoaded: '__loaded',
            classPlaying: '__playing',
            templateHtml: '<div class="full-video__video"><div class="full-video__video__inner"></div></div>',
            ratio: '16:9',
            endPercent: 0.98,
            video: null,
            title: null,
            videoOptions: {},

            callbackLoaded: null,
            callbackEnd: null,
        },
        defaultVideoOptions: {
            background: 1,
            loop: 1,
            autoplay: 1,
        },
        _library: 'https://player.vimeo.com/api/player.js',
        _isLoading: false,
        _loadCallbacks: [],

        getVimeo: function(callback) {
            var Vimeo = window.Vimeo;
            if (Vimeo != null) {
                // Already loaded
                callback(Vimeo);
                return;
            }

            // Enqueue callback
            this._loadCallbacks.push(callback);
            if (this._isLoading) {
                return;
            }

            // Load library
            this._isLoading = true;
            var _this = this;
            $.getScript(this._library, function() {
                // Trigger all registered callbacks
                for (var i = 0; i < _this._loadCallbacks.length; i++) {
                    _this._loadCallbacks[i](Vimeo);
                }

                // Clear callbacks
                _this._loadCallbacks = [];
            });
        },
    });

    $.extend(FullVideo.prototype, {
        $container: null,
        _$video: null,
        _options: null,
        _video: null,
        _ratio: null,
        _player: null,
        _title: null,

        _init: function($container, options) {
            this.$container = $container;
            this._options = options;
            this._video = $container.data('video') || options.video;
            if (this._video == null) {
                throw 'Video ID not set';
            }

            this._title = $container.data('title') || options.title;
            this._ratio = parseRatio($container.data('ratio') || options.ratio);

            this._$video = this._buildVideoContainer();
            $container.addClass(this._options.classLoading);

            var _this = this;
            FullVideo.getVimeo(function() {
                _this._$video.appendTo(_this.$container);
                _this._player = _this._buildPlayer(_this._$video.children()[0]);
                _this._setupPlayer(_this._player);

                $(window).on('resize', _this.resize.bind(_this));
            });
        },

        _buildVideoContainer: function() {
            var el = $.parseHTML(this._options.templateHtml, document);
            return $(el);
        },
        _buildPlayer: function(target) {
            var videoOptions = $.extend(
                {
                    url: 'https://player.vimeo.com/video/' + encodeURIComponent(this._video),
                },
                FullVideo.defaultVideoOptions,
                this._options.videoOptions
            );
            return new window.Vimeo.Player(target, videoOptions);
        },

        _setupPlayer: function(player) {
            var _this = this;

            var callbackEndLoading = function() {
                player.off('bufferend', callbackEndLoading);
                player.off('timeupdate', callbackEndLoading);

                _this.activate();

                // Ensure video playing
                window.setTimeout(function() {
                    player.play();
                }, 1);
            };
            player.on('bufferend', callbackEndLoading);
            player.on('timeupdate', callbackEndLoading);

            var callbackStop = function() {
                player.play();
            };
            player.on('ended', callbackStop);

            // Track completing video
            var endPercent = this._options.endPercent;
            var endCallback = this._options.callbackEnd;
            var callbackTracking = function(e) {
                if (e.percent >= endPercent) {
                    player.off('timeupdate', callbackTracking);
                    endCallback && endCallback.call(_this);
                }
            };
            player.on('timeupdate', callbackTracking);

            this.resize();
        },

        activate: function() {
            this.$container.removeClass(this._options.classLoading).addClass(this._options.classLoaded);
            this._options.callbackLoaded && this._options.callbackLoaded.call(this);
        },

        resize: function() {
            var parentRatio = this.$container.height() / this.$container.width();

            var ratio = parentRatio / this._ratio,
                percent = ratio * 100,
                overRatio = ratio > 1;

            this._$video.css({
                width: overRatio ? percent + '%' : '',
                'margin-left': overRatio ? -(percent - 100) / 2 + '%' : '',
                'margin-top': overRatio ? '' : (percent - 100) / 4 + '%',
            });
        },
    });

    $.fn.fullVideo = function(options) {
        return this.each(function() {
            var $item = $(this);
            var video = new FullVideo($item, options);
            $item.data('full-video', video);
        });
    };

    $.FullVideo = FullVideo;
})(window.jQuery);
