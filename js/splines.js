class Splines {
    static pascalTriangle = [[1], [1, 1]];
    static nChooseK(n, k) {
        while (this.pascalTriangle.length <= n) {
            let row = [1];
            let currentN = this.pascalTriangle.length;
            for (let i = 1; i < currentN; i++)
                row.push(this.pascalTriangle[currentN - 1][i - 1] + this.pascalTriangle[currentN - 1][i]);
            row.push(1);
            this.pascalTriangle.push(row);
        }

        return this.pascalTriangle[n][k];
    }
    static _check(t, len) {
        if (t < 0 || t > len - 1)
            throw new Error("t out of bounds [0, " + (len - 1) + "] with value " + t);
    }
    static interpolateFullBezier(t, path) {
        this._check(t, path.length);

        t /= path.length - 1;

        let sum = [0, 0];
        for (let i = 0; i < path.length; i++) {
            let coeff = this.nChooseK(path.length - 1, i) * Math.pow(t, i) * Math.pow(1 - t, path.length - 1 - i);
            sum[0] += coeff * path[i].x;
            sum[1] += coeff * path[i].y;
        }

        return sum;
    }
    // TODO: fixa konstigt hopp i början av banan
    static interpolateLocalBezier(t, path, n, smooth) {
        this._check(t, path.length);

        let newT = t - (n / 2);
        let minInd = Math.max(0, Math.round(newT));

        let interpol = (t - minInd) / n;
        let sum = [0, 0];

        for (let i = 0; i <= n; i++) {
            let coeff = this.nChooseK(n, i) * Math.pow(interpol, i) * Math.pow(1 - interpol, n - i);
            sum[0] += coeff * path[Math.min(path.length - 1, minInd + i)].x;
            sum[1] += coeff * path[Math.min(path.length - 1, minInd + i)].y;
        }

        if (smooth && minInd > 0) {
            let otherSum = [0, 0];
            const offset = -1;
            let otherInterpol = Math.max(0, Math.min(n, t - minInd - offset) / n);

            for (let i = 0; i <= n; i++) {
                let coeff = this.nChooseK(n, i) * Math.pow(otherInterpol, i) * Math.pow(1 - otherInterpol, n - i);
                otherSum[0] += coeff * path[Math.max(0, Math.min(path.length - 1, minInd + i + offset))].x;
                otherSum[1] += coeff * path[Math.max(0, Math.min(path.length - 1, minInd + i + offset))].y;
            }

            t += 0.5 * (~n & 1);
            let metaInterpol = t - Math.trunc(t);

            sum[0] = metaInterpol * sum[0] + (1 - metaInterpol) * otherSum[0];
            sum[1] = metaInterpol * sum[1] + (1 - metaInterpol) * otherSum[1];
        }
        
        return sum;
    }
    static interpolateHermite(t, path) {
        this._check(t, path.length);

        if (Math.floor(t) === t)
            return [path[Math.floor(t)], path[Math.floor(t)]];

        let prev = path[Math.floor(t)];
        let next = path[Math.ceil(t)];
        let prevprev = t > 1 ? path[Math.floor(t - 1)] : prev;
        let nextnext = t < path.length - 2 ? path[Math.ceil(t + 1)] : next;

        let interpol = t - Math.trunc(t);
        /*  x(t) = d + ct + bt^2 + at^3
            d = x0
            c = x0'
            b = -3x0 + 3x1 - 2x0' - x1'
            a = 2x0 - 2x1 + x0' + x1'   */
        return [
            prev.x + interpol * (prev.x - prevprev.x
                + interpol * (3 * (next.x - prev.x) - 2 * (prev.x - prevprev.x) - (nextnext.x - next.x)
                    + interpol * (3 * (prev.x - next.x) - prevprev.x + nextnext.x)
                )),
            prev.y + interpol * (prev.y - prevprev.y
                + interpol * (3 * (next.y - prev.y) - 2 * (prev.y - prevprev.y) - (nextnext.y - next.y)
                    + interpol * (3 * (prev.y - next.y) - prevprev.y + nextnext.y)
                ))
        ];
    }
    static interpolateLinear(t, path) {
        this._check(t, path.length);

        if (Math.floor(t) === t)
            return [
                path[Math.floor(t)].x,
                path[Math.floor(t)].y
            ];
        else {
            let prev = path[Math.floor(t)];
            let next = path[Math.ceil(t)];
            let interpol = t - Math.floor(t);

            return [
                prev.x * (1 - interpol) + next.x * interpol,
                prev.y * (1 - interpol) + next.y * interpol
            ];
        }
    }
}