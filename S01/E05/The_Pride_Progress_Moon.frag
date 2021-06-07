#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/lygia/math/const.glsl"
#include "../../modules/lygia/sdf/circleSDF.glsl"
#include "../../modules/lygia/draw/fill.glsl"
#include "../../modules/lygia/generative/cnoise.glsl"
#include "../../modules/lygia/space/ratio.glsl"

bool moonTerrainMovement = true;
float moonTerrainPosition = 1.0;
float audioBarAmount = 20.;
float audioIntensity = .5;
float audioPosition = 0.5;
float audioShadowIntensity = 10.;
float elevationSize = 10.0;

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
vec3 black = vec3(.0, .0, .0);

    
/*
 * Creates "The Moon" from Pixel Spirit Deck
 * and adds the possibility to change the size
 */
float getMoon(vec2 st, float size) {
    float moon = fill(circleSDF(st), size);
    // Introduced this magic numbers to come close to what was originally 
    // defined in "The Moon", but to also be able to change the size
    // of the moon itself
    float magicRatio = 1.3;
    float magricRationOffest = magicRatio * 10.0;
    vec2 offset = vec2(size / magricRationOffest * 2.0, size / magricRationOffest);
    moon -= fill(circleSDF(st - offset), size / magicRatio);

    return moon;
}

float decimation(float value, float presicion) {
    return floor(value * presicion) / presicion;
}

/*
 * Create elevation using perlin noise
 */
float getElevation(vec2 st, float size) {
    float elevation = cnoise(st * size);
    elevation += abs(cnoise(st * 60.0) * .42);
    // elevation += abs(cnoise(st * 200.0) * .1);
    // elevation += abs(cnoise(st * 1000.0) * .25);

    return elevation;
}

/*
 * Get the color for the terrain (sand, forest, snow)
 */
vec3 getTerrain(float elevation) {

    vec3 terrain = mix(blue, purple, (elevation - .175) / .175);

    if (elevation > 0.4) {
        terrain = mix(green, yellow, (elevation - .4) / .4);
    }

    if (elevation > 0.8) {
        terrain = mix(orange, red, (elevation - .7) / .7);
    }

    return terrain;
}

/*
 * Get the color of the ocean
 */
vec3 getOcean(float elevation) {
    float _elevation = - elevation;
    vec3 ocean = mix(black, brown, (_elevation - .095) / .095);

    if (_elevation > .3) {
        ocean = mix(cyan * .25, cyan, _elevation);
    }

    if (_elevation > .4) {
        ocean = mix(pink, white , (_elevation - .4) / .4);
    }

    return ocean;
}

/*
 * Get the color of the shadow based on if an object is behind
 * another object
 */
float getShadow(vec2 st, float elevation, float elevationSize, float intensity, float iterations) {
    vec2 towardLight = st;
    float shadow = .0;

    for (float i = .0; i <= iterations; i++) {
        float towardElevation = getElevation(st + towardLight / iterations * .01 * i, elevationSize);

        // The object is behind another object, so we add shadow to it
        if (towardElevation > elevation) {
            shadow += (1. / iterations) * intensity;
        }
    }

    return shadow;
}

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = ratio(st, u_resolution);

    vec2 audioX_1 = texture2D(u_tex0, vec2(decimation(st.x + audioPosition, audioBarAmount), 0.0)).xy;
    vec2 audioX_2 = texture2D(u_tex0, vec2(decimation(1.0 - st.x + audioPosition, audioBarAmount), 0.0)).xy;
    float audioReactiveX = (audioX_1.x * audioX_2.x) * audioIntensity;

    // vec2 audioY_1 = texture2D(u<_tex0, vec2(decimation(st.y + audioPosition, audioBarAmount), 0.0)).xy;
    // vec2 audioY_2 = texture2D(u_tex0, vec2(decimation(1.0 - st.y + audioPosition, audioBarAmount), 0.0)).xy;
    // float audioReactiveY = (audioY_1.x * audioY_2.x) * intensity;

    vec2 audioSt = vec2(st.x, st.y + audioReactiveX);

    color.rgb += getMoon(st, .75);

    if (color.r + color.g + color.b >= 3.0) {
        float movement = + u_time * .01;

        // Is the movement even active??
        if (!moonTerrainMovement) {
            movement = 0.0;
        }

        // Moving the terrain only from top to bottom
        vec2 movingSt = vec2(audioSt.x, audioSt.y + movement + moonTerrainPosition);

        float elevation = getElevation(movingSt, elevationSize);
        float audioElevation = elevation + (elevation * (audioReactiveX * 15.));

        float shadow = getShadow(movingSt, elevation, elevationSize, .2, 3.0);
        float audioShadow = getShadow(st, elevation, elevationSize, audioReactiveX * audioShadowIntensity, 3.0);

        // Terrain
        if (elevation > 0.175) {
            color.rgb = getTerrain(audioElevation) - shadow;
        // Ocean
        } else {
            color.rgb = getOcean(audioElevation) - audioShadow * .15;
        }
    }
    
    color.a = 1.0;
    gl_FragColor = vec4(color);
}
