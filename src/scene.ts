import type { mat4 } from "gl-matrix";

export class Scene {

    constructor(
        readonly modelMatrix: mat4,
        readonly viewMatrix: mat4,
        readonly projectionMatrix: mat4,
        readonly gl: WebGLRenderingContext,
        viewportWidth: number = 800,
        viewportHeight: number = 600,
    ) {
        gl.viewport(0, 0, viewportWidth, viewportHeight);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT)
    }
}

