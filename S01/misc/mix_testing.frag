#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 color1 = vec3(1.0, 0.0, 0.0);
    vec3 color2 = vec3(0.0, 0.0, 1.0);

    color.rgb = mix(color1, color2, st.x);
    color.a = 1.;

    gl_FragColor = vec4(color);
}
