import KdeModesPanel from '../../components/CompareResults/KdeModesPanel';
import { fftkde } from '../../utils/kde.js';
import { render, screen } from '../utils/test-utils';

// Build a deterministic synthetic KDE curve (sum of Gaussian bumps on a uniform
// grid) so we can drive fitModesFromKde without relying on the real fftkde.
// fftkde is auto-mocked in setupTests; each test overrides it per-call.
function gaussianCurve(
  grid: { lo: number; hi: number; n: number },
  bumps: Array<{ mu: number; sigma: number; weight: number }>,
) {
  const { lo, hi, n } = grid;
  const x = new Array<number>(n);
  const y = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const xi = lo + ((hi - lo) * i) / (n - 1);
    let yi = 0;
    for (const { mu, sigma, weight } of bumps) {
      yi +=
        (weight * Math.exp(-((xi - mu) ** 2) / (2 * sigma ** 2))) /
        (sigma * Math.sqrt(2 * Math.PI));
    }
    x[i] = xi;
    y[i] = yi;
  }
  return { x, y, bandwidth: 1 };
}

function mockKdePerSeries(
  baseCurve: ReturnType<typeof gaussianCurve>,
  newCurve: ReturnType<typeof gaussianCurve>,
) {
  // safeKde calls fftkde once per side. Subsequent fallback calls (silverman)
  // only happen if the first throws — our mocks succeed, so two calls cover it.
  (fftkde as jest.Mock)
    .mockImplementationOnce(() => baseCurve)
    .mockImplementationOnce(() => newCurve);
}

describe('KdeModesPanel', () => {
  it('renders nothing when neither side is multimodal', () => {
    const curve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 50, sigma: 5, weight: 1 },
    ]);
    mockKdePerSeries(curve, curve);

    const { container } = render(
      <KdeModesPanel
        baseValues={[48, 50, 51, 49, 50]}
        newValues={[49, 51, 50, 50, 49]}
        unit='ms'
        vt={0.5}
        showModes={true}
        isSubtest={true}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders verdict + matched-mode rows for a bimodal comparison', () => {
    const baseCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    const newCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    mockKdePerSeries(baseCurve, newCurve);

    render(
      <KdeModesPanel
        baseValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        newValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        unit='ms'
        vt={0.5}
        showModes={true}
        isSubtest={true}
      />,
    );

    expect(screen.getByText(/2 modes base · 2 modes new/)).toBeInTheDocument();
    expect(screen.getByText('Mode A')).toBeInTheDocument();
    expect(screen.getByText('Mode B')).toBeInTheDocument();
    expect(screen.getAllByText(/fast path/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/slow path/).length).toBeGreaterThan(0);
  });

  it('flags an unmatched new mode as a new path', () => {
    const baseCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
    ]);
    const newCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    mockKdePerSeries(baseCurve, newCurve);

    render(
      <KdeModesPanel
        baseValues={[18, 19, 20, 21, 22, 18, 19, 20, 21, 22]}
        newValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        unit='ms'
        vt={0.5}
        showModes={true}
        isSubtest={true}
      />,
    );

    expect(screen.getByText(/new path — these runs/)).toBeInTheDocument();
  });

  it('flags an unmatched base mode as gone', () => {
    const baseCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    const newCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
    ]);
    mockKdePerSeries(baseCurve, newCurve);

    render(
      <KdeModesPanel
        baseValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        newValues={[18, 19, 20, 21, 22, 18, 19, 20, 21, 22]}
        unit='ms'
        vt={0.5}
        showModes={true}
        isSubtest={true}
      />,
    );

    expect(screen.getByText(/gone — these runs/)).toBeInTheDocument();
  });

  it('renders nothing when showModes is false (matches the chart’s mode-overlay toggle)', () => {
    const baseCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    const newCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    mockKdePerSeries(baseCurve, newCurve);

    const { container } = render(
      <KdeModesPanel
        baseValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        newValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 22]}
        unit='ms'
        vt={0.5}
        showModes={false}
        isSubtest={true}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to "samples/iter" when unit is null', () => {
    const baseCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    const newCurve = gaussianCurve({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    mockKdePerSeries(baseCurve, newCurve);

    render(
      <KdeModesPanel
        baseValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        newValues={[18, 19, 20, 21, 22, 78, 79, 80, 81, 82]}
        unit={null}
        vt={0.5}
        showModes={true}
        isSubtest={true}
      />,
    );

    expect(screen.getAllByText(/samples\/iter/).length).toBeGreaterThan(0);
  });
});
