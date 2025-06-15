#version 300 es
precision highp float;

// This fragment shader performs the water heightmap simulation step. 
//It updates the simulation texture using a simple wave propagation model: 
//it averages the surrounding height values, applies velocity damping, and updates height and velocity accordingly.

in vec2 v_coord; // passed from vertex shader
out vec4 outColor;

uniform sampler2D u_texture;         //LIGHTGLtexture
uniform vec2 u_delta;                //LIGHTGLdelta

void main() {
    vec4 info = texture(u_texture, v_coord); // current texel

    vec2 dx = vec2(u_delta.x, 0.0f);
    vec2 dy = vec2(0.0f, u_delta.y);

    float average = (texture(u_texture, v_coord - dx).r +
        texture(u_texture, v_coord + dx).r +
        texture(u_texture, v_coord - dy).r +
        texture(u_texture, v_coord + dy).r) * 0.25f;

    info.g += (average - info.r) * 2.0f; // velocity update
    info.g *= 0.995f;                    // damping
    info.r += info.g;                   // height update

    outColor = info;
}
