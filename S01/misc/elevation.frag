#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/lygia/generative/cnoise.glsl"

// Terrain
vec3 sandColor = vec3(0.96, 0.64, 0.38);
vec3 forestColor = vec3(0.0, .4, .1);
vec3 meltedSnowColor = vec3(0.8, 0.9, 1.0);
vec3 snowColor = vec3(1.0, 1.0, 1.0);

// Ocean
vec3 deepOceanColor = vec3(.2, .54, .75) * .1;
vec3 shoreColor = vec3(.4, .75, .95);

/*
 * Create elevation using perlin noise
 */
float getElevation(vec2 st, float size) {
    float elevation = cnoise(st * size);
    elevation += abs(cnoise(st * 10.0) * .2);
    elevation += abs(cnoise(st * 200.0) * .1);
    elevation += abs(cnoise(st * 1000.0) * .15);

    return elevation;
}

/*
 * Get the color for the terrain (sand, forest, snow)
 */
vec3 getTerrain(float elevation) {
    vec3 terrain = mix(sandColor, forestColor, elevation);

    // Add some snow on top of the mountains
    if (elevation > 0.7) {
        terrain = mix(meltedSnowColor, snowColor, (elevation - .7) / .7);
    }

    return terrain;
}

/*
 * Get the color of the ocean
 */
vec3 getOcean(float elevation) {
    // More dark color in areas that are more far away from
    // the beach = - elevation
    vec3 ocean = mix(shoreColor, deepOceanColor, - elevation);

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

    float elevationSize = 2.0;
    float elevation = getElevation(st, elevationSize);
    float shadow = getShadow(st, elevation, elevationSize, 0.1, 3.0);

    // Terrain
    if (elevation > 0.0) {
        color.rgb = getTerrain(elevation) - shadow;
    // Ocean
    } else {
        color.rgb = getOcean(elevation) - shadow * .2;
    }

    color.a = 1.0;

    gl_FragColor = vec4(color);
}
