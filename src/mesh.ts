import { Vector3 } from './vector';
import { Matrix } from './matrix';
export class Indexer<T> {
    unique: T[] = [];
    indices: number[] = [];
    private map = new Map<string, number>();

    add(obj: T): number {
        const key = JSON.stringify(obj);
        if (!this.map.has(key)) {
            this.map.set(key, this.unique.length);
            this.unique.push(obj);
        }
        return this.map.get(key)!;
    }
}

export class GLBuffer<T extends number[] = number[]> {
    glBuffer: WebGLBuffer | null = null;
    data: T[] = [];
    spacing = 0;
    length = 0;

    constructor(
        private readonly gl: WebGLRenderingContext,
        public readonly target: GLenum,
        public readonly type: Float32ArrayConstructor | Uint16ArrayConstructor
    ) { }

    compile(usage: GLenum = this.gl.STATIC_DRAW): void {
        const flat: number[] = [];
        for (let i = 0; i < this.data.length; i += 10000) {
            flat.push(...[].concat(...this.data.slice(i, i + 10000) as any));
        }

        this.spacing = flat.length / this.data.length;
        if (!Number.isInteger(this.spacing)) {
            throw new Error(`Inconsistent buffer spacing: ${this.spacing}`);
        }

        this.length = flat.length;
        this.glBuffer = this.glBuffer || this.gl.createBuffer();
        this.gl.bindBuffer(this.target, this.glBuffer);
        this.gl.bufferData(this.target, new this.type(flat), usage);
    }
}

type AABB = { min: Vector; max: Vector };
type BoundingSphere = { center: Vector; radius: number };

interface MeshOptions {
    coords?: boolean;
    normals?: boolean;
    colors?: boolean;
    triangles?: boolean;
    lines?: boolean;
}

export class Mesh {
    vertexBuffers: Record<string, GLBuffer> = {};
    indexBuffers: Record<string, GLBuffer> = {};
    vertices: number[][] = [];
    coords?: number[][];
    normals?: number[][];
    colors?: number[][];
    triangles?: number[][];
    lines?: number[][];

    constructor(
        private readonly gl: WebGLRenderingContext,
        options: MeshOptions = {}
    ) {
        this.addVertexBuffer('vertices', 'gl_Vertex');
        if (options.coords) this.addVertexBuffer('coords', 'gl_TexCoord');
        if (options.normals) this.addVertexBuffer('normals', 'gl_Normal');
        if (options.colors) this.addVertexBuffer('colors', 'gl_Color');
        if (options.triangles ?? true) this.addIndexBuffer('triangles');
        if (options.lines) this.addIndexBuffer('lines');
    }

    addVertexBuffer(name: string, attribute: string) {
        const buffer = new GLBuffer(this.gl, this.gl.ARRAY_BUFFER, Float32Array);
        buffer.name = name;
        this.vertexBuffers[attribute] = buffer;
        (this as any)[name] = [];
    }

    addIndexBuffer(name: string) {
        const buffer = new GLBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
        this.indexBuffers[name] = buffer;
        (this as any)[name] = [];
    }

    compile() {
        for (const attr in this.vertexBuffers) {
            const buffer = this.vertexBuffers[attr];
            buffer.data = (this as any)[buffer.name];
            buffer.compile();
        }
        for (const name in this.indexBuffers) {
            const buffer = this.indexBuffers[name];
            buffer.data = (this as any)[name];
            buffer.compile();
        }
    }

    transform(matrix: Matrix): this {
        this.vertices = this.vertices.map(v => matrix.transformPoint(Vector.fromArray(v)).toArray());
        if (this.normals) {
            const invTrans = matrix.inverse().transpose();
            this.normals = this.normals.map(n => invTrans.transformVector(Vector.fromArray(n)).unit().toArray());
        }
        this.compile();
        return this;
    }

    computeNormals(): this {
        if (!this.normals) this.addVertexBuffer('normals', 'gl_Normal');
        this.normals = Array(this.vertices.length).fill(0).map(() => new Vector());

        for (const [i0, i1, i2] of this.triangles!) {
            const a = Vector.fromArray(this.vertices[i0]);
            const b = Vector.fromArray(this.vertices[i1]);
            const c = Vector.fromArray(this.vertices[i2]);
            const normal = b.subtract(a).cross(c.subtract(a)).unit();
            this.normals[i0] = (this.normals[i0] as Vector).add(normal);
            this.normals[i1] = (this.normals[i1] as Vector).add(normal);
            this.normals[i2] = (this.normals[i2] as Vector).add(normal);
        }

        this.normals = this.normals.map(n => (n as Vector).unit().toArray());
        this.compile();
        return this;
    }

    computeWireframe(): this {
        const indexer = new Indexer<[number, number]>();
        for (const tri of this.triangles!) {
            for (let j = 0; j < 3; j++) {
                const a = tri[j], b = tri[(j + 1) % 3];
                indexer.add([Math.min(a, b), Math.max(a, b)]);
            }
        }
        if (!this.lines) this.addIndexBuffer('lines');
        this.lines = indexer.unique;
        this.compile();
        return this;
    }

    getAABB(): AABB {
        const min = new Vector(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        const max = min.negative();
        for (const v of this.vertices) {
            const vec = Vector.fromArray(v);
            min.assign(Vector.min(min, vec));
            max.assign(Vector.max(max, vec));
        }
        return { min, max };
    }

    getBoundingSphere(): BoundingSphere {
        const { min, max } = this.getAABB();
        const center = min.add(max).divide(2);
        let radius = 0;
        for (const v of this.vertices) {
            const dist = Vector.fromArray(v).subtract(center).length();
            radius = Math.max(radius, dist);
        }
        return { center, radius };
    }

    static plane(gl: WebGLRenderingContext, options: MeshOptions & { detailX?: number, detailY?: number, detail?: number } = {}): Mesh {
        const mesh = new Mesh(gl, options);
        const detailX = options.detailX ?? options.detail ?? 1;
        const detailY = options.detailY ?? options.detail ?? 1;

        for (let y = 0; y <= detailY; y++) {
            const t = y / detailY;
            for (let x = 0; x <= detailX; x++) {
                const s = x / detailX;
                mesh.vertices.push([2 * s - 1, 2 * t - 1, 0]);
                if (mesh.coords) mesh.coords.push([s, t]);
                if (mesh.normals) mesh.normals.push([0, 0, 1]);
                if (x < detailX && y < detailY) {
                    const i = x + y * (detailX + 1);
                    mesh.triangles!.push([i, i + 1, i + detailX + 1]);
                    mesh.triangles!.push([i + detailX + 1, i + 1, i + detailX + 2]);
                }
            }
        }

        mesh.compile();
        return mesh;
    }

    static cube(gl: WebGLRenderingContext, options: MeshOptions = {}): Mesh {
        const mesh = new Mesh(gl, options);
        const cubeData = [
            [0, 4, 2, 6, -1, 0, 0], [1, 3, 5, 7, +1, 0, 0],
            [0, 1, 4, 5, 0, -1, 0], [2, 6, 3, 7, 0, +1, 0],
            [0, 2, 1, 3, 0, 0, -1], [4, 5, 6, 7, 0, 0, +1]
        ];

        const pickOctant = (i: number): Vector => new Vector((i & 1) * 2 - 1, (i & 2) - 1, (i & 4) / 2 - 1);

        for (let i = 0; i < cubeData.length; i++) {
            const [a, b, c, d, nx, ny, nz] = cubeData[i];
            const base = i * 4;
            for (const j of [a, b, c, d]) {
                mesh.vertices.push(pickOctant(j).toArray());
                if (mesh.coords) mesh.coords.push([j & 1, (j & 2) / 2]);
                if (mesh.normals) mesh.normals.push([nx, ny, nz]);
            }
            mesh.triangles!.push([base, base + 1, base + 2]);
            mesh.triangles!.push([base + 2, base + 1, base + 3]);
        }

        mesh.compile();
        return mesh;
    }

    static load(gl: WebGLRenderingContext, json: any, options: MeshOptions = {}): Mesh {
        options.coords ??= !!json.coords;
        options.normals ??= !!json.normals;
        options.colors ??= !!json.colors;
        options.triangles ??= !!json.triangles;
        options.lines ??= !!json.lines;

        const mesh = new Mesh(gl, options);
        mesh.vertices = json.vertices;
        if (options.coords) mesh.coords = json.coords;
        if (options.normals) mesh.normals = json.normals;
        if (options.colors) mesh.colors = json.colors;
        if (options.triangles) mesh.triangles = json.triangles;
        if (options.lines) mesh.lines = json.lines;
        mesh.compile();
        return mesh;
    }
}