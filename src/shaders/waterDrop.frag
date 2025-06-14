#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;

in vec2 inCoord;
out vec4 outColor;

const float PI = 3.141592653589793f;

void main() {
    vec4 info = texture(uTexture, inCoord);

    float drop = max(0.0f, 1.0f - length(uCenter * 0.5f + 0.5f - inCoord) / uRadius);
    drop = 0.5f - cos(drop * PI) * 0.5f;

    info.r += drop * uStrength;

    outColor = info;
}
