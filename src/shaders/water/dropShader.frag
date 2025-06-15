#version 300 es
precision highp float;

//These shaders implement the "drop disturbance" effect in the water simulation. The vertex shader computes texture coordinates from geometry (used for a fullscreen quad or plane), and the fragment shader applies a radial disturbance (drop) at a specified center with a falloff defined by a cosine-based profile.

in vec2 v_coord;
out vec4 outColor;

uniform sampler2D u_texture;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_strength;

const float PI = 3.141592653589793f;

void main() {
    vec4 info = texture(u_texture, v_coord);

    float drop = max(0.0f, 1.0f - length(u_center * 0.5f + 0.5f - v_coord) / u_radius);
    drop = 0.5f - cos(drop * PI) * 0.5f;

    info.r += drop * u_strength;

    outColor = info;
}
