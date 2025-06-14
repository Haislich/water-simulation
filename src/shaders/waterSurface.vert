#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uDelta;

in vec2 coord;
out vec4 outColor;

void main() {
    vec4 info = texture(uTexture, coord);

  // Compute vectors from this point to neighbors
    float height = info.r;
    float heightX = texture(uTexture, vec2(coord.x + uDelta.x, coord.y)).r;
    float heightY = texture(uTexture, vec2(coord.x, uDelta.y + uDelta.y)).r;

    vec3 dx = vec3(uDelta.x, heightX - height, 0.0f);
    vec3 dy = vec3(0.0f, heightY - height, uDelta.y);

  // Normal is perpendicular to surface patch
    vec3 normal = normalize(cross(dy, dx));

  // Store normal.x → blue, normal.z → alpha
    info.b = normal.x;
    info.a = normal.z;

    outColor = info;
}
