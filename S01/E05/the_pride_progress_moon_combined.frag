#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;
uniform vec2        u_resolution;
uniform float       u_time;


#ifndef QTR_PI
#define QTR_PI 0.78539816339
#endif
#ifndef HALF_PI
#define HALF_PI 1.5707963267948966192313216916398
#endif
#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif
#ifndef TAU
#define TAU 6.2831853071795864769252867665590
#endif
#ifndef ONE_OVER_PI
#define ONE_OVER_PI 0.31830988618
#endif
#ifndef PHI
#define PHI 1.618033988749894848204586834
#endif
#ifndef EPSILON
#define EPSILON 0.0000001
#endif
#ifndef GOLDEN_RATIO
#define GOLDEN_RATIO 1.6180339887
#endif
#ifndef GOLDEN_RATIO_CONJUGATE 
#define GOLDEN_RATIO_CONJUGATE 0.61803398875
#endif
#ifndef GOLDEN_ANGLE // (3.-sqrt(5.0))*PI radians
#define GOLDEN_ANGLE 2.39996323
#endif



/*
author: Patricio Gonzalez Vivo
description: Returns a circle-shaped SDF.
use: circleSDF(vec2 st[, vec2 center])
options:
  CIRCLESDF_FNC(POS_UV) : function used to calculate the SDF, defaults to GLSL length function, use lengthSq for a different slope
license: |
  Copyright (c) 2017 Patricio Gonzalez Vivo. All rights reserved.
  Distributed under BSD 3-clause "New" or "Revised" License. See LICENSE file at
  https://github.com/patriciogonzalezvivo/PixelSpiritDeck
*/

#ifndef CIRCLESDF_FNC
#define CIRCLESDF_FNC(POS_UV) length(POS_UV)
#endif

#ifndef FNC_CIRCLESDF
#define FNC_CIRCLESDF

float circleSDF(in vec2 st, in vec2 center) {
    return CIRCLESDF_FNC(st - center) * 2.;
}

float circleSDF(in vec2 st) {
    return circleSDF(st, vec2(.5));
}

#endif




/*
author: Matt DesLauriers
description: Performs a smoothstep using standard derivatives for anti-aliased edges at any level of magnification. From https://github.com/glslify/glsl-aastep
use: aastep(<float> threshold, <float> value)
option:
    AA_EDGE: in the absence of derivatives you can specify the antialiasing factor
license: |
    The MIT License (MIT) Copyright (c) 2015 stackgl
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

#ifndef FNC_AASTEP
#define FNC_AASTEP
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

float aastep(float threshold, float value) {
    #ifdef GL_OES_standard_derivatives
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
    #elif defined(AA_EDGE)
    float afwidth = AA_EDGE;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
    #else 
    return step(threshold, value);
    #endif
}
#endif


/*
author: Patricio Gonzalez Vivo
description: fill a SDF. From PixelSpiritDeck https://github.com/patriciogonzalezvivo/PixelSpiritDeck
use: fill(<float> sdf, <float> size [, <float> edge])
license: |
  Copyright (c) 2017 Patricio Gonzalez Vivo. All rights reserved.
  Distributed under BSD 3-clause "New" or "Revised" License. See LICENSE file at
  https://github.com/patriciogonzalezvivo/PixelSpiritDeck
*/

#ifndef FNC_FILL
#define FNC_FILL
float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
}

float fill(float x, float size) {
    return 1.0 - aastep(size, x);
}
#endif




/*
author: [Ian McEwan, Ashima Arts]
description: modulus of 289
use: mod289(<float|vec2|vec3|vec4> x)
license: |
  Copyright (C) 2011 Ashima Arts. All rights reserved.
  Distributed under the MIT License. See LICENSE file.
  https://github.com/ashima/webgl-noise
*/
#ifndef FNC_MOD289
#define FNC_MOD289
float mod289(in float x) {
  return x - floor(x * (1. / 289.)) * 289.;
}

vec2 mod289(in vec2 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}

vec3 mod289(in vec3 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}

vec4 mod289(in vec4 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}
#endif




/*
author: [Ian McEwan, Ashima Arts]
description: permute
use: permute(<float|vec2|vec3|vec4> x)
license : |
  Copyright (C) 2011 Ashima Arts. All rights reserved.
  Distributed under the MIT License. See LICENSE file.
  https://github.com/ashima/webgl-noise
*/

#ifndef FNC_PERMUTE
#define FNC_PERMUTE
float permute(in float x) {
     return mod289(((x * 34.) + 1.)*x);
}

vec3 permute(in vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 permute(in vec4 x) {
     return mod289(((x * 34.) + 1.)*x);
}
#endif



/*
author: [Ian McEwan, Ashima Arts]
description: 
use: taylorInvSqrt(<float|vec4> x)
License : |
  Copyright (C) 2011 Ashima Arts. All rights reserved.
  Distributed under the MIT License. See LICENSE file.
  https://github.com/ashima/webgl-noise
*/

#ifndef FNC_TAYLORINVSQRT
#define FNC_TAYLORINVSQRT
float taylorInvSqrt(in float r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 taylorInvSqrt(in vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
#endif


/*
author: [Ian McEwan, Ashima Arts]
description: fade
use: fade(<vec2|vec3|vec4> t)
license: |
  Copyright (C) 2011 Ashima Arts. All rights reserved.
  Distributed under the MIT License. See LICENSE file.
  https://github.com/ashima/webgl-noise
*/

#ifndef FNC_FADE
#define FNC_FADE
float fade(in float t) {
  return t * t * t * (t * (t * 6. - 15.) + 10.);
}

vec2 fade(in vec2 t) {
  return t * t * t * (t * (t * 6. - 15.) + 10.);
}

vec3 fade(in vec3 t) {
  return t * t * t * (t * (t * 6. - 15. ) + 10.);
}

vec4 fade(vec4 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}
#endif



/*
author: [Ian McEwan, Ashima Arts]
description: Classic Perlin Noise https://github.com/ashima/webgl-noise
use: cnoise(<vec2|vec3|vec4> pos)
license: |
  Copyright (C) 2011 Ashima Arts. All rights reserved.
  Copyright (C) 2011-2016 by Stefan Gustavson (Classic noise and others)
    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  Neither the name of the GPUImage framework nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#ifndef FNC_CNOISE
#define FNC_CNOISE

float cnoise(in vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    vec4 gy = abs(gx) - 0.5 ;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;

    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

float cnoise(in vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

float cnoise(in vec4 P) {
    vec4 Pi0 = floor(P); // Integer part for indexing
    vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec4 Pf0 = fract(P); // Fractional part for interpolation
    vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = vec4(Pi0.zzzz);
    vec4 iz1 = vec4(Pi1.zzzz);
    vec4 iw0 = vec4(Pi0.wwww);
    vec4 iw1 = vec4(Pi1.wwww);

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 ixy00 = permute(ixy0 + iw0);
    vec4 ixy01 = permute(ixy0 + iw1);
    vec4 ixy10 = permute(ixy1 + iw0);
    vec4 ixy11 = permute(ixy1 + iw1);

    vec4 gx00 = ixy00 * (1.0 / 7.0);
    vec4 gy00 = floor(gx00) * (1.0 / 7.0);
    vec4 gz00 = floor(gy00) * (1.0 / 6.0);
    gx00 = fract(gx00) - 0.5;
    gy00 = fract(gy00) - 0.5;
    gz00 = fract(gz00) - 0.5;
    vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
    vec4 sw00 = step(gw00, vec4(0.0));
    gx00 -= sw00 * (step(0.0, gx00) - 0.5);
    gy00 -= sw00 * (step(0.0, gy00) - 0.5);

    vec4 gx01 = ixy01 * (1.0 / 7.0);
    vec4 gy01 = floor(gx01) * (1.0 / 7.0);
    vec4 gz01 = floor(gy01) * (1.0 / 6.0);
    gx01 = fract(gx01) - 0.5;
    gy01 = fract(gy01) - 0.5;
    gz01 = fract(gz01) - 0.5;
    vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
    vec4 sw01 = step(gw01, vec4(0.0));
    gx01 -= sw01 * (step(0.0, gx01) - 0.5);
    gy01 -= sw01 * (step(0.0, gy01) - 0.5);

    vec4 gx10 = ixy10 * (1.0 / 7.0);
    vec4 gy10 = floor(gx10) * (1.0 / 7.0);
    vec4 gz10 = floor(gy10) * (1.0 / 6.0);
    gx10 = fract(gx10) - 0.5;
    gy10 = fract(gy10) - 0.5;
    gz10 = fract(gz10) - 0.5;
    vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
    vec4 sw10 = step(gw10, vec4(0.0));
    gx10 -= sw10 * (step(0.0, gx10) - 0.5);
    gy10 -= sw10 * (step(0.0, gy10) - 0.5);

    vec4 gx11 = ixy11 * (1.0 / 7.0);
    vec4 gy11 = floor(gx11) * (1.0 / 7.0);
    vec4 gz11 = floor(gy11) * (1.0 / 6.0);
    gx11 = fract(gx11) - 0.5;
    gy11 = fract(gy11) - 0.5;
    gz11 = fract(gz11) - 0.5;
    vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
    vec4 sw11 = step(gw11, vec4(0.0));
    gx11 -= sw11 * (step(0.0, gx11) - 0.5);
    gy11 -= sw11 * (step(0.0, gy11) - 0.5);

    vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
    vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
    vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
    vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
    vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
    vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
    vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
    vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
    vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
    vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
    vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
    vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
    vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
    vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
    vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
    vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

    vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
    g0000 *= norm00.x;
    g0100 *= norm00.y;
    g1000 *= norm00.z;
    g1100 *= norm00.w;

    vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
    g0001 *= norm01.x;
    g0101 *= norm01.y;
    g1001 *= norm01.z;
    g1101 *= norm01.w;

    vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
    g0010 *= norm10.x;
    g0110 *= norm10.y;
    g1010 *= norm10.z;
    g1110 *= norm10.w;

    vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
    g0011 *= norm11.x;
    g0111 *= norm11.y;
    g1011 *= norm11.z;
    g1111 *= norm11.w;

    float n0000 = dot(g0000, Pf0);
    float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
    float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
    float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
    float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
    float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
    float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
    float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
    float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
    float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
    float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
    float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
    float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
    float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
    float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
    float n1111 = dot(g1111, Pf1);

    vec4 fade_xyzw = fade(Pf0);
    vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
    vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
    vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
    vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
    float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
    return 2.2 * n_xyzw;
}
#endif



/*
author: Patricio Gonzalez Vivo
description: Fix the aspect ratio of a space keeping things squared for you.
use: ratio(vec2 st, vec2 st_size)
license: |
  Copyright (c) 2017 Patricio Gonzalez Vivo.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.    
*/

#ifndef FNC_RATIO
#define FNC_RATIO
vec2 ratio(in vec2 st, in vec2 s) {
    return mix( vec2((st.x*s.x/s.y)-(s.x*.5-s.y*.5)/s.y,st.y),
                vec2(st.x,st.y*(s.y/s.x)-(s.y*.5-s.x*.5)/s.x),
                step(s.x,s.y));
}
#endif



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

