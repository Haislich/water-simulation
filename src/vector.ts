export class Vector3 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) { }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    equals(v: Vector3): boolean {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    negative(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    add(v: Vector3 | number): Vector3 {
        if (typeof v === 'number') return new Vector3(this.x + v, this.y + v, this.z + v);
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v: Vector3 | number): Vector3 {
        if (typeof v === 'number') return new Vector3(this.x - v, this.y - v, this.z - v);
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(v: Vector3 | number): Vector3 {
        if (typeof v === 'number') return new Vector3(this.x * v, this.y * v, this.z * v);
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    divide(v: Vector3 | number): Vector3 {
        if (typeof v === 'number') return new Vector3(this.x / v, this.y / v, this.z / v);
        return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length(): number {
        return Math.sqrt(this.dot(this));
    }

    unit(): Vector3 {
        const len = this.length();
        return len !== 0 ? this.divide(len) : new Vector3(0, 0, 0);
    }

    min(): number {
        return Math.min(this.x, this.y, this.z);
    }

    max(): number {
        return Math.max(this.x, this.y, this.z);
    }

    toAngles(): { theta: number; phi: number } {
        return {
            theta: Math.atan2(this.z, this.x),
            phi: Math.asin(this.y / this.length())
        };
    }

    angleTo(v: Vector3): number {
        return Math.acos(this.dot(v) / (this.length() * v.length()));
    }

    toArray(n: number = 3): number[] {
        return [this.x, this.y, this.z].slice(0, n);
    }

    static negative(a: Vector3): Vector3 {
        return a.negative();
    }

    static add(a: Vector3, b: Vector3 | number): Vector3 {
        return a.add(b);
    }

    static subtract(a: Vector3, b: Vector3 | number): Vector3 {
        return a.subtract(b);
    }

    static multiply(a: Vector3, b: Vector3 | number): Vector3 {
        return a.multiply(b);
    }

    static divide(a: Vector3, b: Vector3 | number): Vector3 {
        return a.divide(b);
    }

    static cross(a: Vector3, b: Vector3): Vector3 {
        return a.cross(b);
    }

    static unit(a: Vector3): Vector3 {
        return a.unit();
    }

    static fromAngles(theta: number, phi: number): Vector3 {
        return new Vector3(
            Math.cos(theta) * Math.cos(phi),
            Math.sin(phi),
            Math.sin(theta) * Math.cos(phi)
        );
    }

    static randomDirection(): Vector3 {
        return Vector3.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
    }

    static min(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }

    static max(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }

    static lerp(a: Vector3, b: Vector3, t: number): Vector3 {
        return b.subtract(a).multiply(t).add(a);
    }

    static fromArray(arr: number[]): Vector3 {
        return new Vector3(arr[0], arr[1], arr[2]);
    }

    static angleBetween(a: Vector3, b: Vector3): number {
        return a.angleTo(b);
    }
}
