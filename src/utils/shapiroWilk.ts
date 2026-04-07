// Shapiro-Wilk normality test
// W statistic: Shapiro & Wilk (1965), Biometrika 52(3-4):591-611
// Coefficient approximation: Royston (1992), Statistics and Computing 2(3):117-119
// p-value approximation: Royston (1995)

// Rational approximation to the normal quantile (Beasley-Springer-Moro algorithm)
function normalQuantile(p: number): number {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// Normal CDF (Horner-form erfc approximation, max error ~1.5e-7)
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const p = 1 - poly * Math.exp((-x * x) / 2) * 0.3989422804;
  return x >= 0 ? p : 1 - p;
}

function poly5(coeffs: number[], u: number): number {
  return (
    ((((coeffs[0] * u + coeffs[1]) * u + coeffs[2]) * u + coeffs[3]) * u +
      coeffs[4]) *
      u +
    coeffs[5]
  );
}

function iqrFilter(data: number[]): number[] {
  if (data.length < 4) return data;
  const s = [...data].sort((a, b) => a - b);
  const n = s.length;
  const q1 = s[Math.floor(n * 0.25)];
  const q3 = s[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  return s.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr);
}

export function shapiroWilkTest(
  data: number[],
): { w: number; pvalue: number } | null {
  const x = iqrFilter(data).sort((a, b) => a - b);
  const n = x.length;
  if (n < 3 || n > 5000) return null;

  // Expected normal order statistics
  const m = Array.from({ length: n }, (_, i) =>
    normalQuantile((i + 1 - 0.375) / (n + 0.25)),
  );
  const md = m.reduce((s, v) => s + v * v, 0);
  const sqrtMd = Math.sqrt(md);

  // Royston (1992) polynomial corrections for the first two a coefficients
  // Coefficients from AS R94, Table 1
  const c1 = [-2.706056, 4.434685, -2.07119, -0.147981, 0.221157, 0];
  const c2 = [-3.582633, 5.682633, -1.752461, -0.293762, 0.042981, 0];
  const u = 1 / Math.sqrt(n);
  c1[5] = m[n - 1] / sqrtMd;
  c2[5] = m[n - 2] / sqrtMd;
  const an = poly5(c1, u); // corrected a_n (largest coeff)
  const ann = poly5(c2, u); // corrected a_{n-1}

  // phi normalizes the remaining middle coefficients
  const half = Math.floor(n / 2);
  let phi: number;
  if (n > 5) {
    phi =
      (md - 2 * m[n - 1] ** 2 - 2 * m[n - 2] ** 2) /
      (1 - 2 * an ** 2 - 2 * ann ** 2);
  } else {
    phi = (md - 2 * m[n - 1] ** 2) / (1 - 2 * an ** 2);
  }
  const sqrtPhi = Math.sqrt(phi);

  // Build half-length a array: a[j] is the coefficient for (x[n-1-j] - x[j])
  const a: number[] = Array.from<number>({ length: half });
  a[0] = an;
  if (n > 5 && half > 1) a[1] = ann;
  const startJ = n > 5 ? 2 : 1;
  for (let j = startJ; j < half; j++) {
    a[j] = m[n - 1 - j] / sqrtPhi;
  }

  // W statistic
  const xbar = x.reduce((s, v) => s + v, 0) / n;
  const ss = x.reduce((s, v) => s + (v - xbar) ** 2, 0);
  if (ss === 0) return null;

  let num = 0;
  for (let j = 0; j < half; j++) num += a[j] * (x[n - 1 - j] - x[j]);
  const w = Math.min(num ** 2 / ss, 1);

  // p-value via Royston (1995) log-normal approximation
  const logn = Math.log(n);
  let g: number, mu: number, sigma: number;
  if (n < 12) {
    const gamma = 0.459 * n - 2.273;
    g = -Math.log(gamma - Math.log(1 - w));
    mu = -0.0006714 * n ** 3 + 0.025054 * n ** 2 - 0.39978 * n + 0.544;
    sigma = Math.exp(
      -0.0020322 * n ** 3 + 0.062767 * n ** 2 - 0.77857 * n + 1.3822,
    );
  } else {
    g = Math.log(1 - w);
    mu = 0.0038915 * logn ** 3 - 0.083751 * logn ** 2 - 0.31082 * logn - 1.5861;
    sigma = Math.exp(0.0030302 * logn ** 2 - 0.082676 * logn - 0.4803);
  }

  const pvalue = 1 - normalCDF((g - mu) / sigma);
  return { w, pvalue };
}
