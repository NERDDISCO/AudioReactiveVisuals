#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec3 color = vec3(0.0);
    //float position = length(st - vec2(.5, .5));
    // color = vec3(1.0 - position + sin(u_time), 0, 0);
    // color = vec3(position, 0.0, 0.0);

    // color = vec3(1.0 - step(0.0, st.x - st.y));
    // color = vec3(step(st.x, st.y));
    color = vec3(step(0.5, st.x), 0.0, 1.0 - step(0.5, st.x));

    gl_FragColor = vec4(color, 1.0);
}