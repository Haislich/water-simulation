import { Vector3 } from './vector';

export class HitTest {
    constructor(
        public t: number = Number.MAX_VALUE,
        public hit: Vector3 | null = null,
        public normal: Vector3 | null = null
    ) { }

    mergeWith(other: HitTest): void {
        if (other.t > 0 && other.t < this.t) {
            this.t = other.t;
            this.hit = other.hit;
            this.normal = other.normal;
        }
    }
}
