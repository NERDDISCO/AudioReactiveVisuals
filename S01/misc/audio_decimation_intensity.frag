#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
// The amount of frequencies that are part of u_tex0, usually 256
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float u_time;

#include "../../modules/nd/util/decimation.glsl"

// The amount of "bars" / "frequencies" we want to get out of the audio data
float amount = 1.0;
// Move the start position for the bars, e.g. 0.5 would start from the center
float position = 0.0;
// How visible are the bars, where a higher value means more intensity
float intensity = 10.0;

void main (void) {
    vec3 color = vec3(0.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    // // Left <> Right spread
    // vec2 audio = texture2D(u_tex0, vec2(decimation(st.x + position, amount), 0.0)).xy;
    // vec2 audio2 = texture2D(u_tex0, vec2(decimation(st.x * -1.0 + position, amount), 0.0)).xy;

    // Bottom left crossair
    // vec2 audio = texture2D(u_tex0, vec2(decimation(st.x, amount), 0.0)).xy;
    // vec2 audio2 = texture2D(u_tex0, vec2(decimation(st.y, amount), 0.0)).xy;

    // Interesting patterns
    // vec2 audio = texture2D(u_tex0, vec2(st.y + decimation(st.x, amount), 0.0)).xy;
    // vec2 audio2 = texture2D(u_tex0, vec2(st.x + decimation(st.y, amount), 0.0)).xy;

    // color = vec3((audio.x * audio2.x) * intensity);

    // Reduce the amount to 1.0 to combine all frequencies into one value
    amount = 5.0;
    position = 0.;
    float audio = 0.0;

    color = vec3(texture2D(u_tex0, vec2(0.0001, 0.0)).x);

    // for (float i = .0; i <= amount; i++) {
    //     float x = texture2D(u_tex0, vec2(i / u_tex0Resolution.x, 0.0)).x;
    //     audio += pow(x, 1.0);
    //     audio = x;
    // }
    // if (st.y >= .5) {
    //     color = vec3(audio);
    // }

    vec2 audio2 = texture2D(u_tex0, vec2(decimation(st.x + position, amount), 0.0)).xy;
    if (st.y < .5) {
        color = vec3(audio2.x);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
