/*
 * Calculate the "Energy" to get an idea of the loudness of the audio waveform.
 * 
 * texture = contains the frequencies in x
 * size = the amount of frequencies in the texture (e.g. 256.0)
 * cutoffStart = the index on where to start using the frequencies (e.g. 0.0)
 *
 * If you want to get rid of the high frequencies from the start, you can set 
 *  0.0 > cutoffStart < size
 *
 * 
 * MIT License
 * Copyright (c) 2021 Tim Pietrusky, nerddis.co
 */
float energy(sampler2D texture, float size, float cutoffStart) {
    float energy = .0;
    float freq = .0;
    
    // Iterate over all frequencies that are part of the texture
    // and add all of them together after raising them by the power of 2.0
    for (float i = cutoffStart; i <= size; i++) {
        freq = texture2D(texture, vec2(i / size, 0.0)).y;
        // The original waveform is from -1. to 1., but as that doesn't fit into the
        // texture, it is shifted into 0. to 1., which means we have to normalize
        // the end result here. Otherwise we will always receive a value >= .5
        // even when there is no audio playing
        // see https://www.desmos.com/calculator/ifnqkw5khz
        freq = (freq - .5) / .5;

        energy += pow(freq, 2.0);
    }

    energy /= size;

    return energy;
}