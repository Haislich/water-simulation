#version 300 es
precision highp float;

in vec3 a_position; // previously LIGHTgl_Vertex
out vec2 v_coord;

void main() {
    v_coord = a_position.xy * 0.5f + 0.5f;
    gl_Position = vec4(a_position, 1.0f);
}
