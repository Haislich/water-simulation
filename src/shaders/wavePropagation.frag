#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uDelta;

in vec2 inCoord;
out vec4 outColor;

void main() {
    vec4 info = texture(uTexture, inCoord);

  // Neighboring texel offsets
    vec2 dx = vec2(uDelta.x, 0.0f);
    vec2 dy = vec2(0.0f, uDelta.y);

  // Average neighbor height (finite difference Laplacian)
    float average = (texture(uTexture, inCoord - dx).r +
        texture(uTexture, inCoord + dx).r +
        texture(uTexture, inCoord - dy).r +
        texture(uTexture, inCoord + dy).r) * 0.25f;

  // Accelerate toward the average height (spring-like)
    info.g += (average - info.r) * 2.0f;

  // Damping: simulate viscosity
    info.g *= 0.995f;

  // Update height with velocity
    info.r += info.g;

    outColor = info;
}
