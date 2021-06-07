#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/lygia/color/palette.glsl"
#include "../../modules/lygia/generative/cnoise.glsl"

vec2 repeat(in vec2 st, in float amount) {
    st *= amount;
    st = fract(st);
    
    return st;
}

float position = 0.5;
float threshold = 0.5;
float lines = 1.0;
float amount = 1.0;

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec2 audioLTR = vec2(0.0);
    vec2 audioRTL = vec2(0.0);

    st = repeat(st.xy, amount);

    audioLTR = texture2D(u_tex0, vec2((st.x + position) / lines, 0.0)).xy;
    audioRTL = texture2D(u_tex0, vec2((st.x * -1.0 + position) / lines, 0.0)).xy;


    float color1 = 0.0;
    float color2 = 0.0;

    // Right to left
    if (st.x <= position) {
        color1 = 1.0 - step(audioRTL.x - st.y, threshold);
        color2 = 1.0 - step(audioRTL.x, threshold);

        color.rgb = vec3(mix(color1, color2, 0.1));
        // color.rgb = vec3(1.0 - step(audioRTL.x, threshold));
    }

    // Left to right
    if (st.x >= position) {
        color1 = 1.0 - step(audioLTR.x - st.y, threshold);
        color2 = 1.0 - step(audioLTR.x, threshold);

        color.rgb = vec3(mix(color1, color2, 0.1));

        // color.rgb = vec3(1.0 - step(audioLTR.x, threshold));
    }


    vec3 rainbow = vec3(1.0);

    if (color.r + color.g + color.b >= 3.0) {
        rainbow = palette(
            st.y, 
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(1.0, 1.0, 1.0),
            vec3(0.0, 0.33, 0.67)
        );

        color.rgb = rainbow;

        color.a = 1.0;

        // Add some noise and move it bit based on time + audio
        color.rgb += vec3(cnoise(vec3(vec2(1.0, 1.0) * 1.5, (u_time * .15))));
    }
    
    color.a = 1.0;

    gl_FragColor = vec4(color);
}
