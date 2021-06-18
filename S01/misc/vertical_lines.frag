#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/lygia/draw/stroke.glsl"

void main (void) {
    vec4 color = vec4(1.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float amount = 10.0;
    for (float i = 1.0; i <= amount; i++) {
        float j = (i / amount) - (1.0 / amount);
        color.rgb -= stroke(st.x, j, 0.0025);
    }

    gl_FragColor = vec4(color);
}
