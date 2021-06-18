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
#include "../../modules/nd/audio/rms.glsl"
#include "../../modules/nd/audio/energy.glsl"
#include "../../modules/nd/util/inBetween.glsl"

bool moonTerrainMovement = true;
float moonTerrainMovementSpeed = .01;
float moonTerrainPosition = 1.;
float moonShadowIntensity = .25;
float elevationSize = 10.;
float elevationDetail = 40.;
float shadowIntensity = .1;
float audioRmsThresholdQuiet = .1;
float audioRmsThresholdLoud = .335;
float audioBarAmount = 5.;
float audioIntensity = .15;
float audioPosition = .95;
float audioShadowIntensity = 10.;
float audioElevationIntensity = 8.;
float audioElevationRmsIntensity = .035;

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
float getElevation(vec2 st, float size, float detail) {
    float elevation = cnoise(st * size);
    elevation += abs(cnoise(st * detail) * .42);
    elevation += abs(cnoise(st * 200.0) * .15);

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
        terrain = mix(orange, red, (elevation - .6) / .6);
    }

    return terrain;
}

/*
 * Get the color of the ocean
 */
vec3 getOcean(float elevation) {
    float _elevation = - elevation;
    vec3 ocean = mix(black, brown, (_elevation - .065) / .065);

    if (_elevation > .2) {
        ocean = mix(brown, cyan, (_elevation - .175) / .175);
    }

    if (_elevation > .4) {
        ocean = mix(pink, white, (_elevation - .3) / .3);
    }

    return ocean;
}

/*
 * Get the color of the shadow based on if an object is behind another object
 */
float getShadow(vec2 st, float elevation, float elevationSize, float intensity, float iterations) {
    vec2 towardLight = st;
    float shadow = .0;

    for (float i = .0; i <= iterations; i++) {
        float towardElevation = getElevation(st + towardLight / iterations * .01 * i, elevationSize, elevationDetail);

        // The object is behind another object, so we add shadow to it
        if (towardElevation > elevation) {
            shadow += (1. / iterations) * intensity;
        }
    }

    return shadow;
}

/*
 * Get the color of the surface in combination with audio
 */
vec4 getSurface(vec2 st, vec2 audioSt, float audioReactiveX, float rms) {
    vec4 color = vec4(.0);
    // moonTerrainMovementSpeed += (rms / 100000.0);
    float movement = u_time * moonTerrainMovementSpeed;

    // Is the movement active?
    if (!moonTerrainMovement) {
        movement = .0;
    }

    // Moving the terrain only from left to right
    vec2 movingSt = vec2(audioSt.x - movement - moonTerrainPosition, audioSt.y);

    // Elevation for the surface, used for terrain and ocean
    float elevation = getElevation(movingSt, elevationSize, elevationDetail + (rms * audioElevationRmsIntensity));
    float audioElevation = elevation + (elevation * (audioReactiveX * audioElevationIntensity));

    // Shadow for the terrain / ocean
    float shadow = getShadow(movingSt, elevation, elevationSize, shadowIntensity, 3.0);

    // Terrain
    if (elevation > 0.155) {
        color.rgb = getTerrain(audioElevation) - shadow;
    // Ocean
    } else {
        color.rgb = (getOcean(audioElevation) - shadow);
    }

    return color;
}

void main (void) {
    vec4 color = vec4(0.0);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = ratio(st, u_resolution);

    float rms = rms(u_tex0, u_tex0Resolution.x, .0);
    float rmsFft = rmsFft(u_tex0, u_tex0Resolution.x, .0);
    float energy = energy(u_tex0, u_tex0Resolution.x, .0);
    float rmsMixed = mix(energy, rmsFft, .85);
    float _audioBarAmount = audioBarAmount;

    // if (rms >= audioRmsThresholdQuiet) _audioBarAmount = audioBarAmount;
    if (rms >= audioRmsThresholdLoud) _audioBarAmount = audioBarAmount * 20.;
    // if (rms >= audioRmsThresholdLoud) rmsMixed *= .15;

    // Reduce the amount of audio frequencies to audioBarAmount
    vec2 audioX_1 = texture2D(u_tex0, vec2(decimation(st.x + audioPosition, _audioBarAmount), 0.0)).xy;
    // audioIntensity += energy / 1.;
    // Set the level of audio intensity
    float audioReactiveX = ((audioX_1.x * audioIntensity * rms));
    // float audioReactiveX = (audioX_1.x * .35) / PI;

    // Audio related st
    vec2 audioSt = vec2(st.x, st.y + audioReactiveX);
    vec2 audioSt_surface = vec2(st.x, st.y + (pow(st.y * audioReactiveX, 1.1)));

    // moonShadow
    color.rgb += getMoon(vec2(audioSt.x, audioSt.y + .02), .75 + (energy/ PI)) * moonShadowIntensity;
    // moon
    color += getMoon(st, .75);

    // Surface of the moon
    if (color.r + color.g + color.b >= 3.0) {
        color.rgb = getSurface(st, audioSt_surface, audioReactiveX, rmsMixed).rgb;
        color.a = 1.0;
    // Surface of the moonShadow
    } else if (color.r + color.g + color.b > 0.0) {
        color.rgb += mix(getSurface(st, audioSt, audioReactiveX, rmsMixed).rgb, getSurface(st, audioSt, audioReactiveX, rmsMixed).brg, .75);
        color.a = 0.2;
    }
    
    gl_FragColor = vec4(color);
}
