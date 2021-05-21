#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/glslViewer/examples/2D/02_pixelspiritdeck/lib/stroke.glsl"
#include "../../modules/lygia/space/ratio.glsl"
#include "../../modules/lygia/color/palette/heatmap.glsl"
#include "../../modules/lygia/generative/cnoise.glsl"
#include "../../modules/lygia/space/scale.glsl"

float thinkness = .075;
float scale = 1.0;
float amount = 1.0;
float noiseSpeed = .15;
float noiseSize = 10.0;
float audioIntensity = .35;
float glitchThreshold = .75;
float glitchIntensity = .025;
bool keepRatio = false;
bool globalWave = true;

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 audio = vec2(0.0);

    if (keepRatio) {
        st = ratio(st, u_resolution);
    }

    // Save a reference to st before it gets changed so we can still apply
    // global effects using st
    vec2 globalSt = st;

    // Create a pattern based on the amount
    st *= amount;
    st = fract(st);

    // Apply some scaling
    st = scale(st, scale);

    // Apply the audio globally and not just to each element of the pattern
    if (globalWave) {
        // Extract the audio data (FFT and volume) from the texture
        audio = texture2D(u_tex0, vec2(globalSt.x, 0.0)).xy;
    // Apply the audio to each element of the pattern
    } else {
        // Extract the audio data (FFT and volume) from the texture
        audio = texture2D(u_tex0, vec2(st.x, 0.0)).xy;
    }

    // Control the intensity of the changes by audio
    audio.x *= audioIntensity;

    // A bit of glitchy movement when we have audio
    if (audio.y >= glitchThreshold) {
        globalSt.x += audio.y * glitchIntensity;
        st.x += audio.y * glitchIntensity;
    }

    // Restrict the audio range
    float clampedAudio = clamp(audio.x, .15, .85);
    float wave = .35 + clampedAudio;

    // Bar from top left -> bottom right
    float sdf = .5 + (st.x - st.y) * 0.5;
    color.rgb += stroke(sdf, wave, thinkness);

    // Bar from bottom left -> top right
    float sdf_inv = (st.x + st.y) * .5;
    color.rgb += stroke(sdf_inv, wave, thinkness);

    // Detect the pixels of the hanged man (white = a pixel)
    if (color.r + color.g + color.b >= 3.0) {
        // Draw the heatmap on top of every pixel with a bit of audio distortion
        color.rgb = heatmap(st.x + audio.x);

        // Add some more color variation
        if (globalSt.x >= 0.5) {
            color.rgb *= heatmap(globalSt.y + audio.x);
        }

        // Add some more color variation
        if (globalSt.y <= 0.5) {
            color.rgb *= heatmap(globalSt.x - audio.x);
        }

        // Make this pixel visible
        color.a = 1.0;

        // Add some noise and move it bit based on time + audio
        color.rgb += vec3(cnoise(vec3(globalSt * noiseSize, (u_time * noiseSpeed) + audio.x)));
    }

    gl_FragColor = vec4(color);
}
