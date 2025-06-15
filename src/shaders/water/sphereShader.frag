#version 300 es
precision highp float;

// This fragment shader simulates volume displacement caused by a moving sphere in the water simulation. It adds back the displaced water volume from the old sphere position and subtracts the new one. The displacement uses an exponential falloff profile to ensure smooth, localized water deformation.

in vec2 v_coord; // from vertex shader
out vec4 outColor;

uniform sampler2D u_texture;         //LIGHTGLtexture
uniform vec3 u_oldCenter;            //LIGHTGLoldCenter
uniform vec3 u_newCenter;            //LIGHTGLnewCenter
uniform float u_radius;              //LIGHTGLradius

float volumeInSphere(vec3 center) {
    vec3 toCenter = vec3(v_coord * 2.0f - 1.0f, 0.0f) - center;
    float t = length(toCenter) / u_radius;
    float dy = exp(-pow(t * 1.5f, 6.0f));
    float ymin = min(0.0f, center.y - dy);
    float ymax = min(max(0.0f, center.y + dy), ymin + 2.0f * dy);
    return (ymax - ymin) * 0.1f;
}

void main() {
    vec4 info = texture(u_texture, v_coord);

    info.r += volumeInSphere(u_oldCenter);
    info.r -= volumeInSphere(u_newCenter);

    outColor = info;
}
