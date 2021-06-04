#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/lygia/draw/stroke.glsl"
#include "../../modules/lygia/sdf/circleSDF.glsl"
#include "../../modules/lygia/color/palette.glsl"
#include "../../modules/lygia/generative/cnoise.glsl"
#include "../../modules/lygia/generative/random.glsl"
#include "../../modules/lygia/space/ratio.glsl"
#include "../../modules/lygia/space/scale.glsl"

/*
 * Draw the circle (The High Priestess) at a specific position by using "center"
 */
float highPriestess(vec2 st, vec2 center, float size, float width) {
  return stroke(circleSDF(st, center), size, width);
}

float size = .35;
float sizeSmallCircle = .245;
float width = .05;
float widthSmallCircle = .15;
float noiseSpeed = .15;
float noiseSize = 10.0;
float morphSpeed = .005;
float scale = 1.5;

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    st = scale(st, scale);
    st = ratio(st, u_resolution);

    vec2 audio = vec2(.0);
    vec2 audioMassive = vec2(.0);

    // Extract the audio data (FFT and volume) from the texture
    audio = texture2D(u_tex0, vec2(st.x, 0.0)).xy;
    audioMassive.x = (audio.x * .25) * 3.25;
    
    // Make the audio more soft
    audio.x *= .05;

    float audioReactive1 = st.x - audioMassive.x * .5;
    float audioReactive2 = st.y - audioMassive.x * .5;
    // float audioReactive3 = sizeSmallCircle + audio.x + random(floor(u_time * 3.0)) * .8;
    // float audioReactive3 = sizeSmallCircle + audio.x * 12.5;
    float audioReactive3 = sizeSmallCircle + (.25 + .25 * sin(u_time * morphSpeed)) + audio.x;
    float audioReactive4 = width + audioMassive.x;
    float audioReactive5 = .75 + audio.x;

    float circle_center = highPriestess(st, vec2(.5, .5), size, audioReactive4);

    float circle_bottomleft = highPriestess(st, vec2(.3, .3), audioReactive3, widthSmallCircle);
    float circle_topleft = highPriestess(st, vec2(.3, .7), audioReactive3, widthSmallCircle);
    float circle_bottomright = highPriestess(st, vec2(.7, .3), audioReactive3, widthSmallCircle);
    float circle_topright = highPriestess(st, vec2(.7, .7), audioReactive3, widthSmallCircle);

    color.rgb += vec3(circle_bottomleft);
    color.rgb += vec3(circle_topleft);
    color.rgb += vec3(circle_bottomright);
    color.rgb += vec3(circle_topright);
    color.rgb *= vec3(circle_center);

    vec3 color2 = vec3(0.0);
    color2.rgb += vec3(circle_bottomleft);
    color2.rgb += vec3(circle_topleft);
    color2.rgb += vec3(circle_bottomright);
    color2.rgb += vec3(circle_topright);
    color2.rgb += vec3(circle_center);

    color.rgb = mix(color.rgb, color2.rgb, .5);
    // color.rgb = mix(color.rgb, color2.rgb, .5 + .5 * sin(audioMassive.x * 10.));

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
        color.rgb += vec3(cnoise(vec3(vec2(audioReactive1, audioReactive2) * noiseSize, (u_time * noiseSpeed) + audioMassive.x)));
    }

    gl_FragColor = vec4(color);
}
