#version 300 es
precision highp float;

in vec3 position;
out vec2 coord;

void main() {
    coord = position.xy * 0.5f + 0.5f;
    gl_Position = vec4(position, 1.0f);
}
