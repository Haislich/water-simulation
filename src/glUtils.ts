import { Vector3 } from './vector';
import { Matrix } from './Matrix';

// Assume these come from your matrix stack
export function getModelviewMatrix(gl: WebGLRenderingContext): Matrix {
    // Replace with actual retrieval from your GL wrapper
    // e.g., return gl.modelviewMatrix;
    throw new Error('getModelviewMatrix() not implemented');
}

export function getProjectionMatrix(gl: WebGLRenderingContext): Matrix {
    throw new Error('getProjectionMatrix() not implemented');
}

export function getViewport(gl: WebGLRenderingContext): Int32Array {
    return gl.getParameter(gl.VIEWPORT);
}

export function unProject(
    gl: WebGLRenderingContext,
    winX: number,
    winY: number,
    winZ: number,
    modelview: Matrix = getModelviewMatrix(gl),
    projection: Matrix = getProjectionMatrix(gl),
    viewport: Int32Array = getViewport(gl)
): Vector3 {
    const x = (winX - viewport[0]) / viewport[2] * 2 - 1;
    const y = (winY - viewport[1]) / viewport[3] * 2 - 1;
    const z = winZ * 2 - 1;
    const point = new Vector3(x, y, z);

    const inv = Matrix.inverse(projection.multiply(modelview));
    return inv.transformPoint(point);
}
