
export class GLBuffer {
    gl: WebGL2RenderingContext;
    buffer: WebGLBuffer;
    target: number;
    spacing: number = 0;
    length: number = 0; // ✅ add this

    constructor(gl: WebGL2RenderingContext, target: number) {
        this.gl = gl;
        this.target = target;
        this.buffer = gl.createBuffer()!;
    }

    upload(data: number[][]) {
        const flat = data.flat();
        this.length = flat.length;
        this.spacing = data.length > 0 ? flat.length / data.length : 0;
        this.gl.bindBuffer(this.target, this.buffer);
        const array = this.target === this.gl.ARRAY_BUFFER
            ? new Float32Array(flat)
            : new Uint16Array(flat);
        this.gl.bufferData(this.target, array, this.gl.STATIC_DRAW);
    }
}



export class Mesh {
    gl: WebGL2RenderingContext;
    vertexData: Record<string, number[][]> = {};
    indexData: Record<string, number[][]> = {};
    vertexBuffers: Record<string, GLBuffer> = {};
    indexBuffers: Record<string, GLBuffer> = {};

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.vertexData["positions"] = [];
        this.indexData["triangles"] = [];
    }

    addVertexAttribute(name: string) {
        this.vertexData[name] = [];
    }

    compile() {
        for (const key in this.vertexData) {
            const buffer = new GLBuffer(this.gl, this.gl.ARRAY_BUFFER);
            buffer.upload(this.vertexData[key]);
            this.vertexBuffers[key] = buffer;
        }
        for (const key in this.indexData) {
            const buffer = new GLBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER);
            buffer.upload(this.indexData[key]);
            this.indexBuffers[key] = buffer;
        }
    }

    static createPlane(gl: WebGL2RenderingContext, detailX = 1, detailY = 1): Mesh {
        const mesh = new Mesh(gl);
        const positions = mesh.vertexData["positions"];
        const triangles = mesh.indexData["triangles"];

        for (let y = 0; y <= detailY; y++) {
            const t = y / detailY;
            for (let x = 0; x <= detailX; x++) {
                const s = x / detailX;
                positions.push([2 * s - 1, 2 * t - 1, 0]);
                if (x < detailX && y < detailY) {
                    const i = x + y * (detailX + 1);
                    triangles.push([i, i + 1, i + detailX + 1]);
                    triangles.push([i + detailX + 1, i + 1, i + detailX + 2]);
                }
            }
        }

        mesh.compile();
        return mesh;
    }
}
