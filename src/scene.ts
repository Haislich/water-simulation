import { HomogeneousMatrix } from "./matrix";
export class Scene {

    constructor(
        readonly modelMatrix: HomogeneousMatrix,
        readonly viewMatrix: HomogeneousMatrix,
        readonly projectionMatrix: HomogeneousMatrix,
        readonly gl: WebGLRenderingContext,
        viewportWidth: number = 800,
        viewportHeight: number = 600,
    ) {
        gl.viewport(0, 0, viewportWidth, viewportHeight);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT)
    }
}

