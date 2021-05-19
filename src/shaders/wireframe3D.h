#pragma once

#include <string>

const std::string wireframe3D_vert = R"(
#ifdef GL_ES
precision mediump float;
#endif

uniform mat4    u_modelViewProjectionMatrix;
attribute vec4  a_position;

void main(void) {
    gl_Position = u_modelViewProjectionMatrix * a_position;
}
)";

const std::string wireframe3D_frag = R"(
#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 u_color;

void main(void) {
    gl_FragColor = u_color;
}
)";
