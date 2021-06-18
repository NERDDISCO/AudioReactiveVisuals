#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/nd/util/inBetween.glsl"

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // if (inBetween(st.x, .0, .25)) color.r += .25;
    // if (inBetween(st.x, .25, .5)) color.r += .5;
    // if (inBetween(st.x, .5, .75)) color.r += .75;
    // if (inBetween(st.x, .75, 1.)) color.r += 1.;

    float amount = 10.;

    for (float i = 1.0; i <= amount; i++) {
        float j = i / amount;
        if (inBetween(st.x, j - (1.0 / amount), j)) {
            color.r += j;
            color.g += 1.0 - j;
        }
    }

    color.a = 1.0;

    gl_FragColor = vec4(color);
}
