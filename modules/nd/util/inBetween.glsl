/*
 * Returns "true" if the "x" is between "minValue" and "maxValue",
 * otherwise "false".
 *
 *
 * MIT License
 * Copyright (c) 2021 Tim Pietrusky, nerddis.co
 */
bool inBetween(float x, float minValue, float maxValue) {
    return step(minValue, x) * step(x, maxValue) > .0;
}