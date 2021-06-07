#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#include "../../modules/lygia/generative/cnoise.glsl"

void main (void) {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(cnoise(vec3(st * 5.0, u_time)));

    gl_FragColor = vec4(color, 1.0);
}