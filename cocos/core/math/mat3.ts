/*
 Copyright (c) 2018-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { CCClass } from '../data/class';
import { ValueType } from '../value-types/value-type';
import { Quat } from './quat';
import { IMat3Like, IMat4Like, IQuatLike, IVec2Like, IVec3Like } from './type-define';
import { EPSILON, HALF_PI } from './utils';
import { Vec3 } from './vec3';
import { legacyCC } from '../global-exports';

/**
 * @en Mathematical 3x3 matrix.
 * @zh 表示三维（3x3）矩阵。
 */

export class Mat3 extends ValueType {
    public static IDENTITY = Object.freeze(new Mat3());

    /**
     * @en Clone a matrix and save the results to out matrix
     * @zh 获得指定矩阵的拷贝
     */
    public static clone <Out extends IMat3Like> (a: Out) {
        return new Mat3(
            a.m00, a.m01, a.m02,
            a.m03, a.m04, a.m05,
            a.m06, a.m07, a.m08,
        );
    }

    /**
     * @en Copy content of a matrix into another and save the results to out matrix
     * @zh 复制目标矩阵
     */
    public static copy <Out extends IMat3Like> (out: Out, a: Out) {
        out.m00 = a.m00;
        out.m01 = a.m01;
        out.m02 = a.m02;
        out.m03 = a.m03;
        out.m04 = a.m04;
        out.m05 = a.m05;
        out.m06 = a.m06;
        out.m07 = a.m07;
        out.m08 = a.m08;
        return out;
    }

    /**
     * @en Sets the elements of a matrix with the given values and save the results to out matrix
     * @zh 设置矩阵值
     */
    public static set <Out extends IMat3Like>  (
        out: Out,
        m00: number, m01: number, m02: number,
        m03: number, m04: number, m05: number,
        m06: number, m07: number, m08: number,
    ) {
        out.m00 = m00; out.m01 = m01; out.m02 = m02;
        out.m03 = m03; out.m04 = m04; out.m05 = m05;
        out.m06 = m06; out.m07 = m07; out.m08 = m08;
        return out;
    }

    /**
     * @en Reset the out matrix to an identity matrix
     * @zh 将目标赋值为单位矩阵
     */
    public static identity <Out extends IMat3Like> (out: Out) {
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 1;
        out.m05 = 0;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 1;
        return out;
    }

    /**
     * @en Transposes a matrix and save the results to out matrix
     * @zh 转置矩阵
     */
    public static transpose <Out extends IMat3Like> (out: Out, a: Out) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            const a01 = a.m01;
            const a02 = a.m02;
            const a12 = a.m05;
            out.m01 = a.m03;
            out.m02 = a.m06;
            out.m03 = a01;
            out.m05 = a.m07;
            out.m06 = a02;
            out.m07 = a12;
        } else {
            out.m00 = a.m00;
            out.m01 = a.m03;
            out.m02 = a.m06;
            out.m03 = a.m01;
            out.m04 = a.m04;
            out.m05 = a.m07;
            out.m06 = a.m02;
            out.m07 = a.m05;
            out.m08 = a.m08;
        }

        return out;
    }

    /**
     * @en Inverts a matrix. When matrix is not invertible the matrix will be set to zeros.
     * @zh 矩阵求逆，注意，在矩阵不可逆时，会返回一个全为 0 的矩阵。
     */
    public static invert <Out extends IMat3Like> (out: Out, a: Out) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02;
        const a10 = a.m03; const a11 = a.m04; const a12 = a.m05;
        const a20 = a.m06; const a21 = a.m07; const a22 = a.m08;

        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;

        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;

        if (det === 0) {
            out.m00 = 0; out.m01 = 0; out.m02 = 0;
            out.m03 = 0; out.m04 = 0; out.m05 = 0;
            out.m06 = 0; out.m07 = 0; out.m08 = 0;
            return out;
        }
        det = 1.0 / det;

        out.m00 = b01 * det;
        out.m01 = (-a22 * a01 + a02 * a21) * det;
        out.m02 = (a12 * a01 - a02 * a11) * det;
        out.m03 = b11 * det;
        out.m04 = (a22 * a00 - a02 * a20) * det;
        out.m05 = (-a12 * a00 + a02 * a10) * det;
        out.m06 = b21 * det;
        out.m07 = (-a21 * a00 + a01 * a20) * det;
        out.m08 = (a11 * a00 - a01 * a10) * det;
        return out;
    }

    /**
     * @en Calculates the determinant of a matrix
     * @zh 矩阵行列式
     */
    public static determinant <Out extends IMat3Like> (a: Out) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02;
        const a10 = a.m03; const a11 = a.m04; const a12 = a.m05;
        const a20 = a.m06; const a21 = a.m07; const a22 = a.m08;

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }

    /**
     * @en Multiply two matrices explicitly and save the results to out matrix: a * b
     * @zh 矩阵乘法：a * b
     */
    public static multiply <Out extends IMat3Like> (out: Out, a: Out, b: Out) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02;
        const a10 = a.m03; const a11 = a.m04; const a12 = a.m05;
        const a20 = a.m06; const a21 = a.m07; const a22 = a.m08;

        const b00 = b.m00; const b01 = b.m01; const b02 = b.m02;
        const b10 = b.m03; const b11 = b.m04; const b12 = b.m05;
        const b20 = b.m06; const b21 = b.m07; const b22 = b.m08;

        out.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        out.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        out.m02 = b00 * a02 + b01 * a12 + b02 * a22;

        out.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        out.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        out.m05 = b10 * a02 + b11 * a12 + b12 * a22;

        out.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        out.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        out.m08 = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }

    /**
     * @en Take the first third order of the fourth order matrix and multiply by the third order matrix: a * b
     * @zh 取四阶矩阵的前三阶，与三阶矩阵相乘：a * b
     */
    public static multiplyMat4 <Out extends IMat3Like> (out: Out, a: Out, b: IMat4Like) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02;
        const a10 = a.m03; const a11 = a.m04; const a12 = a.m05;
        const a20 = a.m06; const a21 = a.m07; const a22 = a.m08;

        const b00 = b.m00; const b01 = b.m01; const b02 = b.m02;
        const b10 = b.m04; const b11 = b.m05; const b12 = b.m06;
        const b20 = b.m08; const b21 = b.m09; const b22 = b.m10;

        out.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        out.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        out.m02 = b00 * a02 + b01 * a12 + b02 * a22;

        out.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        out.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        out.m05 = b10 * a02 + b11 * a12 + b12 * a22;

        out.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        out.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        out.m08 = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }

    /**
     * @en Multiply a matrix with a translation vector given by a translation offset, first translate, then transform：a * T(v).
     * @zh 在给定矩阵变换基础上加入位移变换，先位移，再变换，即a * T(v)。
     */
    /**
     * @deprecated since v3.8.0, the function name is misleading, please use translate instead.
     */
    public static transform <Out extends IMat3Like, VecLike extends IVec3Like> (out: Out, a: Out, v: VecLike) {
        this.translate(out, a, v);
    }

    /**
     * @en Multiply a matrix with a translation vector given by a translation offset, first translate, then transform：a * T(v).
     * @zh 在给定矩阵变换基础上加入位移变换，先位移，再变换，即a * T(v)。
     */
    public static translate <Out extends IMat3Like, VecLike extends IVec3Like> (out: Out, a: Out, v: VecLike) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02;
        const a10 = a.m03; const a11 = a.m04; const a12 = a.m05;
        const a20 = a.m06; const a21 = a.m07; const a22 = a.m08;
        const x = v.x; const y = v.y;

        out.m00 = a00;
        out.m01 = a01;
        out.m02 = a02;

        out.m03 = a10;
        out.m04 = a11;
        out.m05 = a12;

        out.m06 = x * a00 + y * a10 + a20;
        out.m07 = x * a01 + y * a11 + a21;
        out.m08 = x * a02 + y * a12 + a22;
        return out;
    }

    /**
     * @en Multiply a matrix with a scale matrix given by a scale vector and save the results to out matrix, first scale, then transform：a * S(v).
     * @zh 在给定矩阵变换基础上加入新缩放变换，先缩放，再变换，即a * S(v)。
     */
    public static scale <Out extends IMat3Like, VecLike extends IVec3Like> (out: Out, a: Out, v: VecLike) {
        const x = v.x; const y = v.y;

        out.m00 = x * a.m00;
        out.m01 = x * a.m01;
        out.m02 = x * a.m02;

        out.m03 = y * a.m03;
        out.m04 = y * a.m04;
        out.m05 = y * a.m05;

        out.m06 = a.m06;
        out.m07 = a.m07;
        out.m08 = a.m08;
        return out;
    }

    /**
     * @en Rotates the transform by the given angle and save the results into the out matrix, first rotate, then transform：a * R(rad).
     * @zh 在给定矩阵变换基础上加入新旋转变换，先旋转，再变换，即a * R(rad)。
     * @param rad radian of rotation
     */
    public static rotate <Out extends IMat3Like> (out: Out, a: Out, rad: number) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02;
        const a10 = a.m03; const a11 = a.m04; const a12 = a.m05;
        const a20 = a.m06; const a21 = a.m07; const a22 = a.m08;

        const s = Math.sin(rad);
        const c = Math.cos(rad);

        out.m00 = c * a00 + s * a10;
        out.m01 = c * a01 + s * a11;
        out.m02 = c * a02 + s * a12;

        out.m03 = c * a10 - s * a00;
        out.m04 = c * a11 - s * a01;
        out.m05 = c * a12 - s * a02;

        out.m06 = a20;
        out.m07 = a21;
        out.m08 = a22;
        return out;
    }

    /**
     * @en Copies the first third order matrix of a fourth order matrix to the out third order matrix
     * @zh 取四阶矩阵的前三阶
     */
    public static fromMat4 <Out extends IMat3Like> (out: Out, a: IMat4Like) {
        out.m00 = a.m00;
        out.m01 = a.m01;
        out.m02 = a.m02;
        out.m03 = a.m04;
        out.m04 = a.m05;
        out.m05 = a.m06;
        out.m06 = a.m08;
        out.m07 = a.m09;
        out.m08 = a.m10;
        return out;
    }

    /**
     * @en Sets a third order matrix with view direction and up direction. Then save the results to out matrix
     * @zh 根据视口前方向和上方向计算矩阵
     * @param view The view direction, it`s must be normalized.
     * @param up The view up direction, it`s must be normalized, default value is (0, 1, 0).
     */
    public static fromViewUp <Out extends IMat3Like, VecLike extends IVec3Like> (out: Out, view: VecLike, up?: Vec3) {
        if (Vec3.lengthSqr(view) < EPSILON * EPSILON) {
            Mat3.identity(out);
            return out;
        }

        up = up || Vec3.UNIT_Y;
        Vec3.normalize(v3_1, Vec3.cross(v3_1, up, view));

        if (Vec3.lengthSqr(v3_1) < EPSILON * EPSILON) {
            Mat3.identity(out);
            return out;
        }

        Vec3.cross(v3_2, view, v3_1);
        Mat3.set(
            out,
            v3_1.x, v3_1.y, v3_1.z,
            v3_2.x, v3_2.y, v3_2.z,
            view.x, view.y, view.z,
        );

        return out;
    }

    /**
     * @en Sets the given matrix with a translation vector and save the results to out matrix
     * @zh 计算位移矩阵
     */
    public static fromTranslation <Out extends IMat3Like, VecLike extends IVec2Like> (out: Out, v: VecLike) {
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 1;
        out.m05 = 0;
        out.m06 = v.x;
        out.m07 = v.y;
        out.m08 = 1;
        return out;
    }

    /**
     * @en Sets the given matrix with a scale vector and save the results to out matrix
     * @zh 计算缩放矩阵
     */
    public static fromScaling <Out extends IMat3Like, VecLike extends IVec2Like> (out: Out, v: VecLike) {
        out.m00 = v.x;
        out.m01 = 0;
        out.m02 = 0;

        out.m03 = 0;
        out.m04 = v.y;
        out.m05 = 0;

        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 1;
        return out;
    }

    /**
     * @en Sets the given matrix with a given angle and save the results to out matrix
     * @zh 计算旋转矩阵
     */
    public static fromRotation <Out extends IMat3Like> (out: Out, rad: number) {
        const s = Math.sin(rad); const c = Math.cos(rad);

        out.m00 = c;
        out.m01 = s;
        out.m02 = 0;

        out.m03 = -s;
        out.m04 = c;
        out.m05 = 0;

        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 1;
        return out;
    }

    /**
     * @en Sets the given matrix with the given quaternion and save the results to out matrix
     * @zh 根据四元数旋转信息计算矩阵
     */
    public static fromQuat <Out extends IMat3Like> (out: Out, q: IQuatLike) {
        const x = q.x; const y = q.y; const z = q.z; const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        out.m00 = 1 - yy - zz;
        out.m03 = yx - wz;
        out.m06 = zx + wy;

        out.m01 = yx + wz;
        out.m04 = 1 - xx - zz;
        out.m07 = zy - wx;

        out.m02 = zx - wy;
        out.m05 = zy + wx;
        out.m08 = 1 - xx - yy;

        return out;
    }

    /**
     * @deprecated since v3.8.0, this function is too complicated, and should be split into several functions.
     */
    /**
     * @en Calculates the upper-left 3x3 matrix of a 4x4 matrix's inverse transpose
     * @zh 计算指定四维矩阵的逆转置三维矩阵
     */
    public static inverseTransposeMat4 <Out extends IMat3Like> (out: Out, a: IMat4Like) {
        const a00 = a.m00; const a01 = a.m01; const a02 = a.m02; const a03 = a.m03;
        const a10 = a.m04; const a11 = a.m05; const a12 = a.m06; const a13 = a.m07;
        const a20 = a.m08; const a21 = a.m09; const a22 = a.m10; const a23 = a.m11;
        const a30 = a.m12; const a31 = a.m13; const a32 = a.m14; const a33 = a.m15;

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) {
            return null;
        }
        det = 1.0 / det;

        out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;

        out.m03 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out.m04 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out.m05 = (a01 * b08 - a00 * b10 - a03 * b06) * det;

        out.m06 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out.m07 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out.m08 = (a30 * b04 - a31 * b02 + a33 * b00) * det;

        return out;
    }

    /**
     * @en Transform a matrix object to a flat array
     * @zh 矩阵转数组
     * @param ofs Array Start Offset
     */
    public static toArray <Out extends IWritableArrayLike<number>> (out: Out, m: IMat3Like, ofs = 0) {
        out[ofs + 0] = m.m00;
        out[ofs + 1] = m.m01;
        out[ofs + 2] = m.m02;
        out[ofs + 3] = m.m03;
        out[ofs + 4] = m.m04;
        out[ofs + 5] = m.m05;
        out[ofs + 6] = m.m06;
        out[ofs + 7] = m.m07;
        out[ofs + 8] = m.m08;
        return out;
    }

    /**
     * @en Generates or sets a matrix with a flat array
     * @zh 数组转矩阵
     * @param ofs Array Start Offset
     */
    public static fromArray <Out extends IMat3Like> (out: Out, arr: IWritableArrayLike<number>, ofs = 0) {
        out.m00 = arr[ofs + 0];
        out.m01 = arr[ofs + 1];
        out.m02 = arr[ofs + 2];
        out.m03 = arr[ofs + 3];
        out.m04 = arr[ofs + 4];
        out.m05 = arr[ofs + 5];
        out.m06 = arr[ofs + 6];
        out.m07 = arr[ofs + 7];
        out.m08 = arr[ofs + 8];
        return out;
    }

    /**
     * @en Adds two matrices and save the results to out matrix
     * @zh 逐元素矩阵加法
     */
    public static add <Out extends IMat3Like> (out: Out, a: Out, b: Out) {
        out.m00 = a.m00 + b.m00;
        out.m01 = a.m01 + b.m01;
        out.m02 = a.m02 + b.m02;
        out.m03 = a.m03 + b.m03;
        out.m04 = a.m04 + b.m04;
        out.m05 = a.m05 + b.m05;
        out.m06 = a.m06 + b.m06;
        out.m07 = a.m07 + b.m07;
        out.m08 = a.m08 + b.m08;
        return out;
    }

    /**
     * @en Subtracts matrix b from matrix a and save the results to out matrix
     * @zh 逐元素矩阵减法
     */
    public static subtract <Out extends IMat3Like> (out: Out, a: Out, b: Out) {
        out.m00 = a.m00 - b.m00;
        out.m01 = a.m01 - b.m01;
        out.m02 = a.m02 - b.m02;
        out.m03 = a.m03 - b.m03;
        out.m04 = a.m04 - b.m04;
        out.m05 = a.m05 - b.m05;
        out.m06 = a.m06 - b.m06;
        out.m07 = a.m07 - b.m07;
        out.m08 = a.m08 - b.m08;
        return out;
    }

    /**
     * @en Multiply each element of a matrix by a scalar number and save the results to out matrix
     * @zh 矩阵标量乘法
     */
    public static multiplyScalar <Out extends IMat3Like> (out: Out, a: Out, b: number) {
        out.m00 = a.m00 * b;
        out.m01 = a.m01 * b;
        out.m02 = a.m02 * b;
        out.m03 = a.m03 * b;
        out.m04 = a.m04 * b;
        out.m05 = a.m05 * b;
        out.m06 = a.m06 * b;
        out.m07 = a.m07 * b;
        out.m08 = a.m08 * b;
        return out;
    }

    /**
     * @en Adds two matrices after multiplying each element of the second operand by a scalar number. And save the results to out matrix.
     * @zh 逐元素矩阵标量乘加: A + B * scale
     */
    public static multiplyScalarAndAdd <Out extends IMat3Like> (out: Out, a: Out, b: Out, scale: number) {
        out.m00 = b.m00 * scale + a.m00;
        out.m01 = b.m01 * scale + a.m01;
        out.m02 = b.m02 * scale + a.m02;
        out.m03 = b.m03 * scale + a.m03;
        out.m04 = b.m04 * scale + a.m04;
        out.m05 = b.m05 * scale + a.m05;
        out.m06 = b.m06 * scale + a.m06;
        out.m07 = b.m07 * scale + a.m07;
        out.m08 = b.m08 * scale + a.m08;
        return out;
    }

    /**
     * @en Returns whether the specified matrices are equal.
     * @zh 矩阵等价判断
     */
    public static strictEquals <Out extends IMat3Like> (a: Out, b: Out) {
        return a.m00 === b.m00 && a.m01 === b.m01 && a.m02 === b.m02
            && a.m03 === b.m03 && a.m04 === b.m04 && a.m05 === b.m05
            && a.m06 === b.m06 && a.m07 === b.m07 && a.m08 === b.m08;
    }

    /**
     * @en Returns whether the specified matrices are approximately equal.
     * @zh 排除浮点数误差的矩阵近似等价判断
     */
    public static equals <Out extends IMat3Like> (a: Out, b: Out, epsilon = EPSILON) {
        return (
            Math.abs(a.m00 - b.m00) <= epsilon * Math.max(1.0, Math.abs(a.m00), Math.abs(b.m00))
            && Math.abs(a.m01 - b.m01) <= epsilon * Math.max(1.0, Math.abs(a.m01), Math.abs(b.m01))
            && Math.abs(a.m02 - b.m02) <= epsilon * Math.max(1.0, Math.abs(a.m02), Math.abs(b.m02))
            && Math.abs(a.m03 - b.m03) <= epsilon * Math.max(1.0, Math.abs(a.m03), Math.abs(b.m03))
            && Math.abs(a.m04 - b.m04) <= epsilon * Math.max(1.0, Math.abs(a.m04), Math.abs(b.m04))
            && Math.abs(a.m05 - b.m05) <= epsilon * Math.max(1.0, Math.abs(a.m05), Math.abs(b.m05))
            && Math.abs(a.m06 - b.m06) <= epsilon * Math.max(1.0, Math.abs(a.m06), Math.abs(b.m06))
            && Math.abs(a.m07 - b.m07) <= epsilon * Math.max(1.0, Math.abs(a.m07), Math.abs(b.m07))
            && Math.abs(a.m08 - b.m08) <= epsilon * Math.max(1.0, Math.abs(a.m08), Math.abs(b.m08))
        );
    }

    /**
     * @en Convert Matrix to euler angle, resulting angle y, z in the range of [-PI, PI],
     *  x in the range of [-PI/2, PI/2], the rotation order is YXZ, first rotate around Y, then around X, and finally around Z.
     * @zh 将矩阵转换成欧拉角, 返回角度 y,z 在 [-PI, PI] 区间内, x 在 [-PI/2, PI/2] 区间内，旋转顺序为 YXZ，即先绕Y旋转，再绕X，最后绕Z旋转。
     */
    public static toEuler<InType extends IMat3Like, VecLike extends IVec3Like> (matrix: InType,  v: VecLike): boolean {
        //a[col][row]
        const a00 = matrix.m00; const a01 = matrix.m01; const a02 = matrix.m02;
        const a10 = matrix.m03; const a11 = matrix.m04; const a12 = matrix.m05;
        const a20 = matrix.m06; const a21 = matrix.m07; const a22 = matrix.m08;

        // from http://www.geometrictools.com/Documentation/EulerAngles.pdf
        // YXZ order
        if (a21 < 0.999) {
            if (a21 > -0.999) {
                v.x = Math.asin(-a21);
                v.y = Math.atan2(a20, a22);
                v.z = Math.atan2(a01, a11);
                return true;
            } else {
                // Not unique.  YA - ZA = atan2(r01,r00)
                v.x = HALF_PI;
                v.y = Math.atan2(a10, a00);
                v.z = 0.0;
                return false;
            }
        } else {
            // Not unique.  YA + ZA = atan2(-r01,r00)
            v.x = -HALF_PI;
            v.y = Math.atan2(-a10, a00);
            v.z = 0.0;
            return false;
        }
    }

    /**
     * matrix layout
     * |m00  m03  m06|
     * |m01  m04  m07|
     * |m02  m05  m08|
     */

    /**
     * @en Value at column 0 row 0 of the matrix.
     * @zh 矩阵第 0 列第 0 行的元素。
     */
    public declare m00: number;

    /**
     * @en Value at column 0 row 1 of the matrix.
     * @zh 矩阵第 0 列第 1 行的元素。
     */
    public declare m01: number;

    /**
     * @en Value at column 0 row 2 of the matrix.
     * @zh 矩阵第 0 列第 2 行的元素。
     */
    public declare m02: number;

    /**
     * @en Value at column 1 row 0 of the matrix.
     * @zh 矩阵第 1 列第 0 行的元素。
     */
    public declare m03: number;

    /**
     * @en Value at column 1 row 1 of the matrix.
     * @zh 矩阵第 1 列第 1 行的元素。
     */
    public declare m04: number;

    /**
     * @en Value at column 1 row 2 of the matrix.
     * @zh 矩阵第 1 列第 2 行的元素。
     */
    public declare m05: number;

    /**
     * @en Value at column 2 row 0 of the matrix.
     * @zh 矩阵第 2 列第 0 行的元素。
     */
    public declare m06: number;

    /**
     * @en Value at column 2 row 1 of the matrix.
     * @zh 矩阵第 2 列第 1 行的元素。
     */
    public declare m07: number;

    /**
     * @en Value at column 2 row 2 of the matrix.
     * @zh 矩阵第 2 列第 2 行的元素。
     */
    public declare m08: number;

    constructor (other: Mat3);

    constructor (
        m00?: number, m01?: number, m02?: number,
        m03?: number, m04?: number, m05?: number,
        m06?: number, m07?: number, m08?: number);

    constructor (
        m00: number | Mat3 = 1, m01 = 0, m02 = 0,
        m03 = 0, m04 = 1, m05 = 0,
        m06 = 0, m07 = 0, m08 = 1,
    ) {
        super();
        if (typeof m00 === 'object') {
            this.m00 = m00.m00; this.m01 = m00.m01; this.m02 = m00.m02;
            this.m03 = m00.m03; this.m04 = m00.m04; this.m05 = m00.m05;
            this.m06 = m00.m06; this.m07 = m00.m07; this.m08 = m00.m08;
        } else {
            this.m00 = m00; this.m01 = m01; this.m02 = m02;
            this.m03 = m03; this.m04 = m04; this.m05 = m05;
            this.m06 = m06; this.m07 = m07; this.m08 = m08;
        }
    }

    /**
     * @en Clone a new matrix from the current matrix.
     * @zh 克隆当前矩阵。
     */
    public clone () {
        const t = this;
        return new Mat3(
            t.m00, t.m01, t.m02,
            t.m03, t.m04, t.m05,
            t.m06, t.m07, t.m08,
        );
    }

    /**
     * @en Sets the matrix with another one's value.
     * @zh 设置当前矩阵使其与指定矩阵相等。
     * @param other Specified matrix
     * @return this
     */
    public set (other: Mat3): Mat3;

    /**
     * @en Set the matrix with values of all elements
     * @zh 设置当前矩阵指定元素值。
     * @return this
     */
    public set (m00?: number, m01?: number, m02?: number,
        m03?: number, m04?: number, m05?: number,
        m06?: number, m07?: number, m08?: number): Mat3;

    public set (m00: number | Mat3 = 1, m01 = 0, m02 = 0,
        m03 = 0, m04 = 1, m05 = 0,
        m06 = 0, m07 = 0, m08 = 1) {
        if (typeof m00 === 'object') {
            this.m00 = m00.m00; this.m01 = m00.m01; this.m02 = m00.m02;
            this.m03 = m00.m03; this.m04 = m00.m04; this.m05 = m00.m05;
            this.m06 = m00.m06; this.m07 = m00.m07; this.m08 = m00.m08;
        } else {
            this.m00 = m00; this.m01 = m01; this.m02 = m02;
            this.m03 = m03; this.m04 = m04; this.m05 = m05;
            this.m06 = m06; this.m07 = m07; this.m08 = m08;
        }
        return this;
    }

    /**
     * @en Returns whether the specified matrices are approximately equal.
     * @zh 判断当前矩阵是否在误差范围内与指定矩阵相等。
     * @param other Comparative matrix
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @return Returns `true' when the elements of both matrices are equal; otherwise returns `false'.
     */
    public equals (other: Mat3, epsilon = EPSILON): boolean {
        return (
            Math.abs(this.m00 - other.m00) <= epsilon * Math.max(1.0, Math.abs(this.m00), Math.abs(other.m00))
            && Math.abs(this.m01 - other.m01) <= epsilon * Math.max(1.0, Math.abs(this.m01), Math.abs(other.m01))
            && Math.abs(this.m02 - other.m02) <= epsilon * Math.max(1.0, Math.abs(this.m02), Math.abs(other.m02))
            && Math.abs(this.m03 - other.m03) <= epsilon * Math.max(1.0, Math.abs(this.m03), Math.abs(other.m03))
            && Math.abs(this.m04 - other.m04) <= epsilon * Math.max(1.0, Math.abs(this.m04), Math.abs(other.m04))
            && Math.abs(this.m05 - other.m05) <= epsilon * Math.max(1.0, Math.abs(this.m05), Math.abs(other.m05))
            && Math.abs(this.m06 - other.m06) <= epsilon * Math.max(1.0, Math.abs(this.m06), Math.abs(other.m06))
            && Math.abs(this.m07 - other.m07) <= epsilon * Math.max(1.0, Math.abs(this.m07), Math.abs(other.m07))
            && Math.abs(this.m08 - other.m08) <= epsilon * Math.max(1.0, Math.abs(this.m08), Math.abs(other.m08))
        );
    }

    /**
     * @en Returns whether the specified matrices are equal.
     * @zh 判断当前矩阵是否与指定矩阵相等。
     * @param other Comparative matrix
     * @return Returns `true' when the elements of both matrices are equal; otherwise returns `false'.
     */
    public strictEquals (other: Mat3): boolean {
        return this.m00 === other.m00 && this.m01 === other.m01 && this.m02 === other.m02
            && this.m03 === other.m03 && this.m04 === other.m04 && this.m05 === other.m05
            && this.m06 === other.m06 && this.m07 === other.m07 && this.m08 === other.m08;
    }

    /**
     * @en Returns a string representation of a matrix.
     * @zh 返回当前矩阵的字符串表示。
     * @return The string representation of this matrix
     */
    public toString () {
        const t = this;
        return `[\n${
            t.m00}, ${t.m01}, ${t.m02},\n${
            t.m03},\n${t.m04}, ${t.m05},\n${
            t.m06}, ${t.m07},\n${t.m08}\n`
            + `]`;
    }

    /**
     * @en set the current matrix to an identity matrix.
     * @zh 将当前矩阵设为单位矩阵。
     * @return `this`
     */
    public identity () {
        this.m00 = 1;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 1;
        this.m05 = 0;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 1;
        return this;
    }

    /**
     * @en Transposes the current matrix.
     * @zh 计算当前矩阵的转置矩阵。
     */
    public transpose () {
        const a01 = this.m01; const a02 = this.m02; const a12 = this.m05;
        this.m01 = this.m03;
        this.m02 = this.m06;
        this.m03 = a01;
        this.m05 = this.m07;
        this.m06 = a02;
        this.m07 = a12;
        return this;
    }

    /**
     * @en Inverts the current matrix. When matrix is not invertible the matrix will be set to zeros.
     * @zh 计算当前矩阵的逆矩阵。注意，在矩阵不可逆时，会返回一个全为 0 的矩阵。
     */
    public invert () {
        const a00 = this.m00; const a01 = this.m01; const a02 = this.m02;
        const a10 = this.m03; const a11 = this.m04; const a12 = this.m05;
        const a20 = this.m06; const a21 = this.m07; const a22 = this.m08;

        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;

        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;

        if (det === 0) {
            this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
            return this;
        }
        det = 1.0 / det;

        this.m00 = b01 * det;
        this.m01 = (-a22 * a01 + a02 * a21) * det;
        this.m02 = (a12 * a01 - a02 * a11) * det;
        this.m03 = b11 * det;
        this.m04 = (a22 * a00 - a02 * a20) * det;
        this.m05 = (-a12 * a00 + a02 * a10) * det;
        this.m06 = b21 * det;
        this.m07 = (-a21 * a00 + a01 * a20) * det;
        this.m08 = (a11 * a00 - a01 * a10) * det;
        return this;
    }

    /**
     * @en Calculates the determinant of the current matrix.
     * @zh 计算当前矩阵的行列式。
     * @return 当前矩阵的行列式。
     */
    public determinant (): number {
        const a00 = this.m00; const a01 = this.m01; const a02 = this.m02;
        const a10 = this.m03; const a11 = this.m04; const a12 = this.m05;
        const a20 = this.m06; const a21 = this.m07; const a22 = this.m08;

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }

    /**
     * @en Adds the current matrix and another matrix to the current matrix.
     * @zh 矩阵加法。将当前矩阵与指定矩阵的相加，结果返回给当前矩阵。
     * @param mat the second operand
     */
    public add (mat: Mat3) {
        this.m00 += mat.m00;
        this.m01 += mat.m01;
        this.m02 += mat.m02;
        this.m03 += mat.m03;
        this.m04 += mat.m04;
        this.m05 += mat.m05;
        this.m06 += mat.m06;
        this.m07 += mat.m07;
        this.m08 += mat.m08;
        return this;
    }

    /**
     * @en Subtracts another matrix from the current matrix.
     * @zh 计算矩阵减法。将当前矩阵减去指定矩阵的结果赋值给当前矩阵。
     * @param mat the second operand
     */
    public subtract (mat: Mat3) {
        this.m00 -= mat.m00;
        this.m01 -= mat.m01;
        this.m02 -= mat.m02;
        this.m03 -= mat.m03;
        this.m04 -= mat.m04;
        this.m05 -= mat.m05;
        this.m06 -= mat.m06;
        this.m07 -= mat.m07;
        this.m08 -= mat.m08;
        return this;
    }

    /**
     * @en Multiply the current matrix with another matrix.
     * @zh 矩阵乘法。将当前矩阵左乘指定矩阵的结果赋值给当前矩阵。
     * @param mat the second operand
     */
    public multiply (mat: Mat3) {
        const a00 = this.m00; const a01 = this.m01; const a02 = this.m02;
        const a10 = this.m03; const a11 = this.m04; const a12 = this.m05;
        const a20 = this.m06; const a21 = this.m07; const a22 = this.m08;

        const b00 = mat.m00; const b01 = mat.m01; const b02 = mat.m02;
        const b10 = mat.m03; const b11 = mat.m04; const b12 = mat.m05;
        const b20 = mat.m06; const b21 = mat.m07; const b22 = mat.m08;

        this.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        this.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        this.m02 = b00 * a02 + b01 * a12 + b02 * a22;

        this.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        this.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        this.m05 = b10 * a02 + b11 * a12 + b12 * a22;

        this.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        this.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        this.m08 = b20 * a02 + b21 * a12 + b22 * a22;
        return this;
    }

    /**
     * @en Multiply each element of the current matrix by a scalar number.
     * @zh 矩阵数乘。将当前矩阵与指定标量的数乘结果赋值给当前矩阵。
     * @param scalar amount to scale the matrix's elements by
     */
    public multiplyScalar (scalar: number) {
        this.m00 *= scalar;
        this.m01 *= scalar;
        this.m02 *= scalar;
        this.m03 *= scalar;
        this.m04 *= scalar;
        this.m05 *= scalar;
        this.m06 *= scalar;
        this.m07 *= scalar;
        this.m08 *= scalar;
        return this;
    }

    /**
     * @en Multiply the current matrix with a scale matrix given by a scale vector, that is M * S(vec).
     * @zh 将当前矩阵左乘缩放矩阵的结果赋值给当前矩阵，缩放矩阵由各个轴的缩放给出，即M * S(vec)。
     * @param vec vector to scale by
     */
    public scale (vec: Vec3) {
        const x = vec.x; const y = vec.y;

        this.m00 = x * this.m00;
        this.m01 = x * this.m01;
        this.m02 = x * this.m02;

        this.m03 = y * this.m03;
        this.m04 = y * this.m04;
        this.m05 = y * this.m05;

        this.m06 = this.m06;
        this.m07 = this.m07;
        this.m08 = this.m08;
        return this;
    }

    /**
     * @en Rotates the current matrix by the given angle, that is M * R(rad).
     * @zh 将当前矩阵左乘旋转矩阵的结果赋值给当前矩阵，旋转矩阵由旋转轴和旋转角度给出，即M * R(rad)。
     * @param rad radian of rotation
     */
    public rotate (rad: number) {
        const a00 = this.m00; const a01 = this.m01; const a02 = this.m02;
        const a10 = this.m03; const a11 = this.m04; const a12 = this.m05;
        const a20 = this.m06; const a21 = this.m07; const a22 = this.m08;

        const s = Math.sin(rad);
        const c = Math.cos(rad);

        this.m00 = c * a00 + s * a10;
        this.m01 = c * a01 + s * a11;
        this.m02 = c * a02 + s * a12;

        this.m03 = c * a10 - s * a00;
        this.m04 = c * a11 - s * a01;
        this.m05 = c * a12 - s * a02;

        this.m06 = a20;
        this.m07 = a21;
        this.m08 = a22;
        return this;
    }

    /**
     * @en Resets the current matrix from the given quaternion.
     * @zh 重置当前矩阵的值，使其表示指定四元数表示的旋转变换。
     * @param q The quaternion.
     * @returns this
     */
    public fromQuat (q: Quat) {
        const x = q.x; const y = q.y; const z = q.z; const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        this.m00 = 1 - yy - zz;
        this.m03 = yx - wz;
        this.m06 = zx + wy;

        this.m01 = yx + wz;
        this.m04 = 1 - xx - zz;
        this.m07 = zy - wx;

        this.m02 = zx - wy;
        this.m05 = zy + wx;
        this.m08 = 1 - xx - yy;
        return this;
    }
}

const v3_1 = new Vec3();
const v3_2 = new Vec3();

CCClass.fastDefine('cc.Mat3', Mat3, {
    m00: 1,
    m01: 0,
    m02: 0,
    m03: 0,
    m04: 1,
    m05: 0,
    m06: 0,
    m07: 0,
    m08: 1,
});
legacyCC.Mat3 = Mat3;
