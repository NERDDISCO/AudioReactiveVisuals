<h1>Audio Reactive Visuals / S01E05 / The Pride Progress Moon</h1>

🎇 The final result: https://github.com/NERDDISCO/AudioReactiveVisuals/blob/main/S01/E05/The_Pride_Progress_Moon.frag

## Resources

* https://twitter.com/TimPietrusky/status/1401426817836331008
* https://www.youtube.com/watch?v=gOZo1oDOsNc
* https://graphtoy.com/
* https://blog.mozilla.org/en/products/firefox/pride-browser-themes-for-firefox/
* https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.dailymail.co.uk%2Fi%2Fpix%2F2017%2F09%2F15%2F17%2F44512E0500000578-4888164-image-a-14_1505494028526.jpg&f=1&nofb=1
* https://www.youtube.com/watch?v=rd1J27SLrPU
* https://codepen.io/terabaud/pen/XWMYrmm
* https://shadered.org/
* https://www.araelium.com/screenflick-mac-screen-recorder

## Music

* https://soundcloud.com/radiozora/deerfeeder-entangled


## Warning

If you run this shader in full-screen on a high resolution, it could happen that glslViewer is crashing like this:

```
2021-06-12 22:42:55.586 glslViewer[30347:1342614] GLDRendererMetal command buffer completion error: Error Domain=MTLCommandBufferErrorDomain Code=2 "Caused GPU Hang Error (IOAF code 3)" UserInfo={NSLocalizedDescription=Caused GPU Hang Error (IOAF code 3)}
2021-06-12 22:42:55.668 glslViewer[30347:1343424] GLDRendererMetal command buffer completion error: Error Domain=MTLCommandBufferErrorDomain Code=1 "Discarded (victim of GPU error/recovery) (IOAF code 5)" UserInfo={NSLocalizedDescription=Discarded (victim of GPU error/recovery) (IOAF code 5)}
2021-06-12 22:42:57.270 glslViewer[30347:1343823] GLDRendererMetal command buffer completion error: Error Domain=MTLCommandBufferErrorDomain Code=2 "Caused GPU Hang Error (IOAF code 3)" UserInfo={NSLocalizedDescription=Caused GPU Hang Error (IOAF code 3)}
2021-06-12 22:42:57.271 glslViewer[30347:1342614] GLDRendererMetal command buffer completion error: Error Domain=MTLCommandBufferErrorDomain Code=4 "Ignored (for causing prior/excessive GPU errors) (IOAF code 4)" UserInfo={NSLocalizedDescription=Ignored (for causing prior/excessive GPU errors) (IOAF code 4)}
zsh: abort      glslViewer audio_rms.frag --audio 1
```

This happens because the used functions `rms` and `energy` are executed for each pixel on the screen, even when the resulting value is always the same for every pixel. But as I had no idea on how to make this "good", this is the way right now :D