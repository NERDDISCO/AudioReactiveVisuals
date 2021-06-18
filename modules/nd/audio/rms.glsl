/*
 * Calculate the "Root Mean Square" (RMS) to get an idea of the 
 * loudness of the audio waveform.
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
float rms(sampler2D texture, float size, float cutoffStart) {
    float rms = .0;
    float freq = .0;
    
    // Iterate over all frequencies that are part of the texture
    // and add all of them together after raising them by the power of 2.0
    // to increase the "stength" of frequencies that have a higher value
    for (float i = cutoffStart; i <= size - cutoffStart; i++) {
        freq = texture2D(texture, vec2(i / size, 0.0)).y;
        // The original waveform is from -1. to 1., but as that doesn't fit into the
        // texture, it is shifted into 0. to 1., which means we have to normalize
        // the end result here. Otherwise we will always receive a value >= .5
        // even when there is no audio playing
        // see https://www.desmos.com/calculator/ifnqkw5khz
        freq = (freq - .5) / .5;
        
        rms += pow(freq, 2.0);
    }

    rms /= size;
    rms = sqrt(rms);

    // This is needed to remove "precision-problems" that are triggered by "sqrt", as
    // if there is no audio, the value is never .0, but something else ¯\_(ツ)_/¯
    rms = abs(rms);

    return rms;
}

/*
 * Calculate the "Root Mean Square" (RMS) using fft 
 * to get an idea of the loudness of the audio.
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
float rmsFft(sampler2D texture, float size, float cutoffStart) {
    float rms = .0;
    
    // Iterate over all frequencies that are part of the texture
    // and add all of them together after raising them by the power of 2.0
    // to increase the "stength" of frequencies that have a higher value
    for (float i = cutoffStart; i <= size - cutoffStart; i++) {
        rms += pow(texture2D(texture, vec2(i / size, 0.0)).x, 2.0);
    }

    rms /= size;
    rms = sqrt(rms);

    return rms;
}