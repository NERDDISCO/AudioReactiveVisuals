#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;

// The amount of frequencies that are part of u_tex0, usually 256
uniform vec2        u_tex0Resolution;

uniform vec2        u_resolution;

// #define decimation(value, presicion) (floor(value * presicion)/presicion)

// Simplify the value by the given factor
// see https://graphtoy.com/?f1(x,t)=x&v1=true&f2(x,t)=floor(x%20*%205.0)/5.0&v2=false&f3(x,t)=floor(x%20*%2020.0)/20.0&v3=false&f4(x,t)=floor(x%20*%20256.0)/256.0&v4=false&f5(x,t)=&v5=false&f6(x,t)=&v6=false&grid=true&coords=0.5,0.5,0.6666666666666666
float decimation(float value, float factor) {
    return floor(value * factor) / factor;
}

// The amount of "bars" / "frequencies" we want to get out of the audio data
float amount = 10.0;
// Move the start position for the bars, e.g. 0.5 would start from the center
float position = 0.0;
// How visible are the bars, where a higher value means more intensity
float intensity = 10.0;

void main (void) {
    vec3 color = vec3(0.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    // Left <> Right spread
    vec2 audio = texture2D(u_tex0, vec2(decimation(st.x + position, amount), 0.0)).xy;
    vec2 audio2 = texture2D(u_tex0, vec2(decimation(st.x * -1.0 + position, amount), 0.0)).xy;

    // Bottom left crossair
    // vec2 audio = texture2D(u_tex0, vec2(decimation(st.x, amount), 0.0)).xy;
    // vec2 audio2 = texture2D(u_tex0, vec2(decimation(st.y, amount), 0.0)).xy;

    // Interesting patterns
    // vec2 audio = texture2D(u_tex0, vec2(st.y + decimation(st.x, amount), 0.0)).xy;
    // vec2 audio2 = texture2D(u_tex0, vec2(st.x + decimation(st.y, amount), 0.0)).xy;

    color = vec3((audio.x * audio2.x) * intensity);
    
    gl_FragColor = vec4(color, 1.0);
}
