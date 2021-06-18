#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;
uniform vec2        u_mouse;

uniform sampler2D   u_buffer0;
uniform sampler2D   u_buffer1;

#include "../../modules/lygia/draw/rect.glsl"
#include "../../modules/nd/util/inBetween.glsl"
#include "../../modules/lygia/space/scale.glsl"
#include "../../modules/nd/audio/rms.glsl"
#include "../../modules/nd/audio/energy.glsl"
#include "../../modules/lygia/draw/circle.glsl"
#include "../../modules/lygia/filter/gaussianBlur.glsl"
#include "../../modules/lygia/space/ratio.glsl"

// All the "Pride Progress" colors
vec3 red = vec3(1.0, .0, .0);
vec3 orange = vec3(1.0, 0.64, .0);
vec3 yellow = vec3(1., 1., .0);
vec3 green = vec3(0., 0.5, 0.);
vec3 blue = vec3(.0, .0, 1.0);
vec3 purple = vec3(.5, .0, .5);
vec3 white = vec3(1., 1., 1.);
vec3 pink = vec3(.98, .56, .76);
vec3 cyan = vec3(.38, .76, .93);
vec3 brown = vec3(.4, .21, .04);
vec3 black = vec3(.1, .1, .1);

float colors = 11.;

/*
 * Creates the "The Emperor" from Pixel Spirit Deck
 */
float theEmperor(vec2 st, vec2 size, float outerSize, float outerThickness, float innerSize) {
    float sdf = rectSDF(st, size);
    float color = stroke(sdf, outerSize, outerThickness);
    color += fill(sdf, innerSize);
    return color;
}

vec3 colorize(vec2 st) {
    vec3 color = vec3(0.);
    
    if (inBetween(st.y, 1. - (1.0 / colors), 1.)) color.rgb = red;
    if (inBetween(st.y, 1. - (2.0 / colors), 1. - (1.0 / colors))) color.rgb = orange;
    if (inBetween(st.y, 1. - (3.0 / colors), 1. - (2.0 / colors))) color.rgb = yellow;
    if (inBetween(st.y, 1. - (4.0 / colors), 1. - (3.0 / colors))) color.rgb = green;
    if (inBetween(st.y, 1. - (5.0 / colors), 1. - (4.0 / colors))) color.rgb = blue;
    if (inBetween(st.y, 1. - (6.0 / colors), 1. - (5.0 / colors))) color.rgb = purple;
    if (inBetween(st.y, 1. - (7.0 / colors), 1. - (6.0 / colors))) color.rgb = black;
    if (inBetween(st.y, 1. - (8.0 / colors), 1. - (7.0 / colors))) color.rgb = brown;
    if (inBetween(st.y, 1. - (9.0 / colors), 1. - (8.0 / colors))) color.rgb = cyan;
    if (inBetween(st.y, 1. - (10.0 / colors), 1. - (9.0 / colors))) color.rgb = pink;
    if (inBetween(st.y, 1. - (11.0 / colors), 1. - (10.0 / colors))) color.rgb = white;

    return color;
}

float random (in float x) {
    return fract(sin(x)*43758.5453123);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
    vec3 color = vec3(0.0);
    vec2 st = gl_FragCoord.xy/u_resolution;
    float rms = rmsFft(u_tex0, u_tex0Resolution.x, .0);
    float rmsReduced = rms * .25;
    float energy = energy(u_tex0, u_tex0Resolution.x, .0);

    st = ratio(st, u_resolution);
    st = scale(st, 1.75);

#ifdef BUFFER_0
    // PING BUFFER
    //
    //  Note: Here is where most of the action happens. But need's to read
    //  te content of the previous pass, for that we are making another buffer
    //  BUFFER_1 (u_buffer1)

    // color = texture2D(u_buffer1, scale(st, 2.)).rgb;

    

    color.rgb = gaussianBlur2D(u_buffer0, st, vec2(.15 + rmsReduced), 2).rgb;

    color += theEmperor(st, vec2(1.75), .5, .125 + energy, .1 + rms);

    if (color.r + color.g + color.b >= 3.) {
        color.rgb = colorize(st);
    }

    // Grab the information arround the active pixel
   	vec3 s0 = color.rgb;
   	vec3 pixel = vec3(vec2(2.0) / u_resolution.xy, 0.);
    vec3 s1 = texture2D(u_buffer1, st + (-pixel.zy)).rgb;    //     s1
    vec3 s2 = texture2D(u_buffer1, st + (-pixel.xz)).rgb;    //  s2 s0 s3
    vec3 s3 = texture2D(u_buffer1, st + (pixel.xz)).rgb;     //     s4
    vec3 s4 = texture2D(u_buffer1, st + (pixel.zy)).rgb;

    // color.rgb = s0 - s1 + s2 - s3;
    color.rgb += mix(s0 * .15, s1, .05 + energy);

    // color.rgb = gaussianBlur2D(u_buffer1, st, vec2(.5), 3).rgb;
    // color.rgb -= mix(s0, s3, .15);

    // d += -(s0 - .5) * 2. + (s1 + s2 + s3 + s4 - 2.);

    // d *= 0.99;
    // d *= smoothstep(0.0, 1.0, step(0.5, u_time)); // Clean buffer at startup
    // d = clamp(d * 0.5 + 0.5, 0.0, 1.0);

    // color = vec3(d, color.x, 0.0);

#elif defined( BUFFER_1 )
    // PONG BUFFER
    //
    //  Note: Just copy the content of the BUFFER0 so it can be
    //  read by it in the next frame
    //
    color = texture2D(u_buffer0, st).rgb;

#else
    // Main Buffer
    color = texture2D(u_buffer1, st).rgb;

#endif


    gl_FragColor = vec4(color, 1.0);
}

// void main (void) {
//     vec4 color = vec4(0.0);
//     vec2 st = gl_FragCoord.xy / u_resolution.xy;
//     // float rms = rmsFft(u_tex0, u_tex0Resolution.x, .0);
//     // float rmsReduced = rms * .25;
//     // float energy = energy(u_tex0, u_tex0Resolution.x, .0);

//     // st = scale(st, 1.75);

// #ifdef BUFFER_0
//     // PING BUFFER
//     color.rgb = texture2D(u_buffer1, st).rgb;

//     float d = 0.0;
//     d = 1.75 * stroke(circleSDF(st - u_mouse/u_resolution + 0.5), 0.05, 0.01) * random(st + u_time);

//     //  Grab the information arround the active pixel
//     //
//    	float s0 = color.y;
//    	vec3  pixel = vec3(vec2(2.0)/u_resolution.xy,0.);
//     float s1 = texture2D(u_buffer1, st + (-pixel.zy)).r;    //     s1
//     float s2 = texture2D(u_buffer1, st + (-pixel.xz)).r;    //  s2 s0 s3
//     float s3 = texture2D(u_buffer1, st + (pixel.xz)).r;     //     s4
//     float s4 = texture2D(u_buffer1, st + (pixel.zy)).r;
//     d += -(s0 - .5) * 2. + (s1 + s2 + s3 + s4 - 2.);

//     d *= 0.99;
//     d *= smoothstep(0.0, 1.0, step(0.5, u_time)); // Clean buffer at startup
//     d = clamp(d * 0.5 + 0.5, 0.0, 1.0);

//     color.rgb = vec3(d, color.x, 0.0);

// #elif defined( BUFFER_1 )
//     // PONG BUFFER
//     //
//     //  Note: Just copy the content of the BUFFER0 so it can be 
//     //  read by it in the next frame
//     //
//     color.rgb = texture2D(u_buffer0, st).rgb;

// #else
//     // Main Buffer
//     color.rgb = texture2D(u_buffer1, st).rgb;

//     // st = scale(st, 1.75);

//     // color += theEmperor(st, vec2(1.75), .5, .125 + energy, .1 + rms);

//     // if (color.r + color.g + color.b >= 3.) {
//     //     color.rgb = colorize(st);
//     // }

// #endif

//     gl_FragColor = vec4(color);
// }
