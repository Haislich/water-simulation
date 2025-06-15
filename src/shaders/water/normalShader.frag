#version 300 es
precision highp float;

// This shader updates the normals in the simulation texture based on the local height gradients. 
// It samples neighboring texels to estimate partial derivatives and then computes the surface normal using a cross product. 
// The result is stored in the blue and alpha channels (xz of the normal).

in vec2 v_coord; // from vertex shader
out vec4 outColor;

uniform sampler2D u_texture;         //LIGHTGLtexture
uniform vec2 u_delta;                //LIGHTGLdelta

void main() {
    vec4 info = texture(u_texture, v_coord);

    float heightCenter = info.r;
    float heightX = texture(u_texture, vec2(v_coord.x + u_delta.x, v_coord.y)).r;
    float heightY = texture(u_texture, vec2(v_coord.x, v_coord.y + u_delta.y)).r;

    vec3 dx = vec3(u_delta.x, heightX - heightCenter, 0.0f);
    vec3 dy = vec3(0.0f, heightY - heightCenter, u_delta.y);

    vec3 normal = normalize(cross(dy, dx));
    info.ba = normal.xz;

    outColor = info;
}
