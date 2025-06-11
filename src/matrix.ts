import { Vector3 } from './vector';

export class Matrix {
    m: Float32Array;

    constructor(elements?: number[]) {
        if (elements && elements.length === 16) {
            this.m = new Float32Array(elements);
        } else {
            this.m = Matrix.identity().m;
        }
    }

    static identity(): Matrix {
        const m = new Float32Array(16);
        m[0] = m[5] = m[10] = m[15] = 1;
        return new Matrix([...m]);
    }

    multiply(other: Matrix): Matrix {
        return Matrix.multiply(this, other);
    }

    inverse(): Matrix {
        return Matrix.inverse(this);
    }

    transpose(): Matrix {
        return Matrix.transpose(this);
    }

    transformPoint(v: Vector3): Vector3 {
        const m = this.m;
        const w = m[12] * v.x + m[13] * v.y + m[14] * v.z + m[15];
        return new Vector3(
            (m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3]) / w,
            (m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7]) / w,
            (m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11]) / w
        );
    }

    transformVector3(v: Vector3): Vector3 {
        const m = this.m;
        return new Vector3(
            m[0] * v.x + m[1] * v.y + m[2] * v.z,
            m[4] * v.x + m[5] * v.y + m[6] * v.z,
            m[8] * v.x + m[9] * v.y + m[10] * v.z
        );
    }

    static multiply(a: Matrix, b: Matrix): Matrix {
        const out = new Float32Array(16);
        const am = a.m, bm = b.m;
        for (let i = 0; i < 4; i++) {
            const ai0 = am[i], ai1 = am[i + 4], ai2 = am[i + 8], ai3 = am[i + 12];
            out[i] = ai0 * bm[0] + ai1 * bm[1] + ai2 * bm[2] + ai3 * bm[3];
            out[i + 4] = ai0 * bm[4] + ai1 * bm[5] + ai2 * bm[6] + ai3 * bm[7];
            out[i + 8] = ai0 * bm[8] + ai1 * bm[9] + ai2 * bm[10] + ai3 * bm[11];
            out[i + 12] = ai0 * bm[12] + ai1 * bm[13] + ai2 * bm[14] + ai3 * bm[15];
        }
        return new Matrix([...out]);
    }

    static transpose(m: Matrix): Matrix {
        const a = m.m;
        return new Matrix([
            a[0], a[4], a[8], a[12],
            a[1], a[5], a[9], a[13],
            a[2], a[6], a[10], a[14],
            a[3], a[7], a[11], a[15]
        ]);
    }

    static inverse(m: Matrix): Matrix {
        const inv = new Float32Array(16);
        const a = m.m;

        inv[0] = a[5] * a[10] * a[15] - a[5] * a[14] * a[11] - a[9] * a[6] * a[15] + a[9] * a[14] * a[7] + a[13] * a[6] * a[11] - a[13] * a[10] * a[7];
        inv[1] = -a[1] * a[10] * a[15] + a[1] * a[14] * a[11] + a[9] * a[2] * a[15] - a[9] * a[14] * a[3] - a[13] * a[2] * a[11] + a[13] * a[10] * a[3];
        inv[2] = a[1] * a[6] * a[15] - a[1] * a[14] * a[7] - a[5] * a[2] * a[15] + a[5] * a[14] * a[3] + a[13] * a[2] * a[7] - a[13] * a[6] * a[3];
        inv[3] = -a[1] * a[6] * a[11] + a[1] * a[10] * a[7] + a[5] * a[2] * a[11] - a[5] * a[10] * a[3] - a[9] * a[2] * a[7] + a[9] * a[6] * a[3];

        inv[4] = -a[4] * a[10] * a[15] + a[4] * a[14] * a[11] + a[8] * a[6] * a[15] - a[8] * a[14] * a[7] - a[12] * a[6] * a[11] + a[12] * a[10] * a[7];
        inv[5] = a[0] * a[10] * a[15] - a[0] * a[14] * a[11] - a[8] * a[2] * a[15] + a[8] * a[14] * a[3] + a[12] * a[2] * a[11] - a[12] * a[10] * a[3];
        inv[6] = -a[0] * a[6] * a[15] + a[0] * a[14] * a[7] + a[4] * a[2] * a[15] - a[4] * a[14] * a[3] - a[12] * a[2] * a[7] + a[12] * a[6] * a[3];
        inv[7] = a[0] * a[6] * a[11] - a[0] * a[10] * a[7] - a[4] * a[2] * a[11] + a[4] * a[10] * a[3] + a[8] * a[2] * a[7] - a[8] * a[6] * a[3];

        inv[8] = a[4] * a[9] * a[15] - a[4] * a[13] * a[11] - a[8] * a[5] * a[15] + a[8] * a[13] * a[7] + a[12] * a[5] * a[11] - a[12] * a[9] * a[7];
        inv[9] = -a[0] * a[9] * a[15] + a[0] * a[13] * a[11] + a[8] * a[1] * a[15] - a[8] * a[13] * a[3] - a[12] * a[1] * a[11] + a[12] * a[9] * a[3];
        inv[10] = a[0] * a[5] * a[15] - a[0] * a[13] * a[7] - a[4] * a[1] * a[15] + a[4] * a[13] * a[3] + a[12] * a[1] * a[7] - a[12] * a[5] * a[3];
        inv[11] = -a[0] * a[5] * a[11] + a[0] * a[9] * a[7] + a[4] * a[1] * a[11] - a[4] * a[9] * a[3] - a[8] * a[1] * a[7] + a[8] * a[5] * a[3];

        inv[12] = -a[4] * a[9] * a[14] + a[4] * a[13] * a[10] + a[8] * a[5] * a[14] - a[8] * a[13] * a[6] - a[12] * a[5] * a[10] + a[12] * a[9] * a[6];
        inv[13] = a[0] * a[9] * a[14] - a[0] * a[13] * a[10] - a[8] * a[1] * a[14] + a[8] * a[13] * a[2] + a[12] * a[1] * a[10] - a[12] * a[9] * a[2];
        inv[14] = -a[0] * a[5] * a[14] + a[0] * a[13] * a[6] + a[4] * a[1] * a[14] - a[4] * a[13] * a[2] - a[12] * a[1] * a[6] + a[12] * a[5] * a[2];
        inv[15] = a[0] * a[5] * a[10] - a[0] * a[9] * a[6] - a[4] * a[1] * a[10] + a[4] * a[9] * a[2] + a[8] * a[1] * a[6] - a[8] * a[5] * a[2];

        const det = a[0] * inv[0] + a[1] * inv[4] + a[2] * inv[8] + a[3] * inv[12];
        for (let i = 0; i < 16; i++) inv[i] /= det;

        return new Matrix([...inv]);
    }
}
