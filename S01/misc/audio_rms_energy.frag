uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;

#include "../../modules/nd/audio/rms.glsl"
#include "../../modules/nd/audio/energy.glsl"
#include "../../modules/lygia/draw/stroke.glsl"
#include "../../modules/nd/util/inBetween.glsl"

void main (void) {
    vec4 color = vec4(.0, .0, .0, 1.);
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float fft = texture2D(u_tex0, vec2(st.x, 0.0)).x;
    float waveform = texture2D(u_tex0, vec2(st.x, 0.0)).y;
    float rms = 0.0;
    float amount = 100.;

    // FFT at the top
    if (st.y >= .75) {
        color.rgb = vec3(fft);

    // Waveform underneath FFT
    } else if (inBetween(st.y, .5, .75)) {
        color.rgb = vec3((.5 - waveform) * 3.0);

    // RMS using Waveform
    } else if (inBetween(st.y, .375, .5)) {
        float rms = rms(u_tex0, u_tex0Resolution.x, 0.0);

        // Draw rms from 0.0 to 1.0
        for (float i = 1.0; i <= amount; i++) {
            float j = i / amount;
            float t = j - (1.0 / amount); //+ 0.004;
            if (rms >= t && inBetween(st.x, t, j)) {
                color.rgb = vec3(rms * 2.0);
            } 
        }

    // Energy using Waveform
    } else if (inBetween(st.y, .25, .375)) {
        float energy = energy(u_tex0, u_tex0Resolution.x, 0.0);

        // Draw rms from 0.0 to 1.0
        for (float i = 1.0; i <= amount; i++) {
            float j = i / amount;
            if (energy >= j - (1.0 / amount) && inBetween(st.x, j - (1.0 / amount), j)) {
                color.rgb = vec3(energy * 100.0);
            } 
        }

    // RMS using FFT
    } else if (inBetween(st.y, .125, .25)) {
        float rms = rmsFft(u_tex0, u_tex0Resolution.x, 0.0);

        // Draw rms from 0.0 to 1.0
        for (float i = 1.0; i <= amount; i++) {
            float j = i / amount;
            if (rms >= j - (1.0 / amount) && inBetween(st.x, j - (1.0 / amount), j)) {
                color.rgb = vec3(rms);
            } 
        }

    // Mix RMS Waveform & RMS FFT
    } else if (inBetween(st.y, .0, .125)) {
        float rms = rms(u_tex0, u_tex0Resolution.x, 0.0);
        float rmsFft = rmsFft(u_tex0, u_tex0Resolution.x, 0.0);

        rms = mix(rms, rmsFft, .65);
        // rms = smoothstep(rms, rmsFft, mix(rms, rmsFft, rmsFft - rms));
        // rms = sqrt((pow(rms, 2.0) + pow(rmsFft, 2.0)) / 2.0);
        // rms = smoothstep(rmsFft, rms, sqrt((pow(rms, 2.0) + pow(rmsFft, 2.0)) / 2.0));

        // Draw rms from 0.0 to 1.0
        for (float i = 1.0; i <= amount; i++) {
            float j = i / amount;
            if (rms >= j - (1.0 / amount) && inBetween(st.x, j - (1.0 / amount), j)) {
                color.rgb = vec3(rms * 10.0);
            } 
        }
    }

    // Draw a waveform in the center of the screen
    color.rgb += stroke(st.y, waveform, 0.01);

    // Grid to show the different steps
    if (inBetween(st.y, .0, .5)) {
        // Vertical
        float amount = 10.;
        for (float i = 1.0; i <= amount; i++) {
            float j = (i / amount);
            color.rgb += (stroke(st.x, j, 0.0025)) * 0.25;
        }

        // Horizontal
        amount = 4.;
        for (float i = 1.; i <= amount; i++) {
            float j = i * .125;
            color.rgb += (stroke(st.y, j, 0.0025)) * .25;
        }
    }
    
    gl_FragColor = color;
}