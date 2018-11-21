jQuery Vimeo Full Video
=======================

A jQuery utility for sizing autoplaying background Vimeo videos.

Examples
--------

- [Fill Window](examples/fill-window.html) (ignoring aspect ratio)
- [Inline](examples/inline.html) (preserving aspect ratio)

Basic Usage
-----------

After loading the included `full-video.min.js` and `full-video.min.css` files, the plugin expects the following HTML:

```html
<div class="full-video" data-video="VIDEOID" data-ratio="WIDTH:HEIGHT" data-title="VIDEO TITLE">
    <figure class="full-video__poster">
        <img src="POSTERURL" />
    </figure>
</div>
```

_(To have the video preserve its aspect ratio, add an additional class `full-video--sized` to the outer `div`)_

Replace the following values in the example HTML:

- `VIDEOID` with the ID from the video URL (e.g. `123` from `https://vimeo.com/123`)
- `WIDTH:HEIGHT` with the video aspect ratio (e.g. `16:9` or `4:3`)
- _(Optional)_ `VIDEOTITLE` with the title for the video, or remove the attribute
- `POSTERURL` with the URL for the image to display while loading the video (recommended to match the first frame of the video) 

Next, initiate the video in Javascript (after jQuery and the `full-video.min.js` files are loaded):

```html
<script>$('.full-video').fullVideo()</script>
```

If the Vimeo player API is not already available, it will be loaded before setting up the video.

The `div` can now be positioned and resized freely and the poster and video will scale to fill the container.

Customisation
-------------

The `.fullVideo()` method call accepts an object with the following optional values:

- **`classLoading`:** The class name to add to the outer `div` while loading the video
- **`classLoaded`:** The class name to add to the outer `div` after loading the video
- **`classPlaying`:** The class name to add to the outer `div` after loading the video
- **`templateHtml`:** The HTML to build for the inner video player’s container (must include at least one child element)
- **`ratio`:** The video aspect ratio (e.g. `16:9`) if the `data-ratio` attribute is not set
- **`endPercent`:** The percentage of playback to consider complete and trigger the `callbackEnd` callback
- **`video`:** The video ID if the `data-video` attribute is not set
- **`title`:** The video title if the `data-title` attribute is not set
- **`videoOptions`:** Additional options to pass to the Vimeo player instance (see also `FullVideo.defaultVideoOptions`)
- **`callbackLoaded`:** A function called after the video has completed loading. `this` will be the FullVideo instance.
- **`callbackEnd`:** A function called after the video has completed playing the first loop. `this` will be the FullVideo instance.

### Example

```js
$('.full-video').fullVideo({
    callbackEnd: function() {
        // Log completed videos with Google Analytics
        window.ga && window.ga('send', 'event', 'Video', 'finish');
    },
});
```

Licence
-------

MIT
