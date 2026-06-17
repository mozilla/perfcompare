import { fireEvent } from '@testing-library/react';
import { init as echartsInit } from 'echarts';
import type { EChartsOption, LineSeriesOption } from 'echarts';

import CommonGraph from '../../components/CompareResults/CommonGraph';
import { fftkde } from '../../utils/kde.js';
import { render, screen } from '../utils/test-utils';

// Wrap React.useRef so a single test can substitute a stubbed ref whose
// `.current` stays null — used to exercise the "no DOM element attached"
// early-return inside CommonGraph's init useEffect. The wrapper delegates to
// the real implementation when the override queue is empty, so other tests
// in this file are unaffected.
const mockUseRefOverrides: Array<{ current: unknown }> = [];

jest.mock('react', () => {
  const actualReact = jest.requireActual<typeof import('react')>('react');
  // Spread loses non-enumerable React exports (Component, createElement, …)
  // which downstream code relies on; a Proxy lets us replace `useRef` while
  // forwarding every other property to the real module.
  return new Proxy(actualReact, {
    get(target, prop, receiver) {
      if (prop === 'useRef') {
        return function wrappedUseRef<T>(initialValue: T) {
          const override = mockUseRefOverrides.shift();
          if (override !== undefined) {
            return override;
          }
          return target.useRef(initialValue);
        };
      }
      return Reflect.get(target, prop, receiver) as unknown;
    },
  });
});

// echarts hands the tooltip formatter a pre-built marker HTML string per
// point (a small coloured dot/square). The formatter prepends it to each
// line of the tooltip alongside the seriesName.
type FormatterParam = {
  seriesType: 'line';
  seriesName: string;
  value: [number, number];
  marker: string;
  axisValue?: number;
};

const FAKE_BASE_MARKER = '<span data-test="marker-base"></span>';
const FAKE_NEW_MARKER = '<span data-test="marker-new"></span>';

function getTooltipFormatter(option: EChartsOption) {
  return (
    option.tooltip as unknown as {
      formatter: (p: FormatterParam | FormatterParam[]) => string;
    }
  ).formatter;
}

// Pull the latest EChartsOption that the chart component pushed via
// `instance.setOption(option)`. Each call to `init()` in the mock returns a
// fresh stub, so we walk through the init mock results to find the most
// recently-rendered chart's options.
function getLatestEChartsOption(): EChartsOption {
  const initMock = echartsInit as jest.Mock;
  for (let i = initMock.mock.results.length - 1; i >= 0; i--) {
    const instance = initMock.mock.results[i].value as {
      setOption: jest.Mock<unknown, [EChartsOption, ...unknown[]]>;
    };
    const lastSetOption = instance.setOption.mock.calls.at(-1);
    if (lastSetOption) {
      return lastSetOption[0];
    }
  }
  throw new Error('No echarts setOption call captured');
}

describe('CommonGraph', () => {
  it('resamples both KDEs onto a shared 1024-point x-grid', () => {
    // Both series mock to the same x range so the shared grid spans [10, 30].
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const option = getLatestEChartsOption();
    const series = option.series as LineSeriesOption[];
    const baseData = series[0].data as Array<[number, number]>;
    const newData = series[1].data as Array<[number, number]>;

    expect(baseData).toHaveLength(1024);
    expect(newData).toHaveLength(1024);

    // Endpoints land on the source boundary values.
    expect(baseData[0]).toEqual([10, 0.1]);
    expect(baseData[1023]).toEqual([30, 0.3]);

    // Both series share identical x positions — the property the tooltip relies on.
    expect(newData.map(([x]) => x)).toEqual(baseData.map(([x]) => x));

    // Spot-check linear interpolation near the midpoint x = 20.
    expect(baseData[511][1]).toBeCloseTo(0.2, 2);
    expect(baseData[512][1]).toBeCloseTo(0.2, 2);
  });

  it('zeroes out density outside each source KDE range', () => {
    // Disjoint ranges: base spans [10..30], new spans [50..70]. The shared grid
    // covers the union [10..70], so each curve is 0 where it has no support.
    (fftkde as jest.Mock)
      .mockImplementationOnce(() => ({
        x: [10, 20, 30],
        y: [0.1, 0.2, 0.3],
        bandwidth: 1,
      }))
      .mockImplementationOnce(() => ({
        x: [50, 60, 70],
        y: [0.5, 0.6, 0.7],
        bandwidth: 1,
      }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const option = getLatestEChartsOption();
    const series = option.series as LineSeriesOption[];
    const baseData = series[0].data as Array<[number, number]>;
    const newData = series[1].data as Array<[number, number]>;

    // Around x = 50, base is past its upper bound (30) → 0.
    const baseAtFifty = baseData.find(([x]) => x >= 50);
    expect(baseAtFifty?.[1]).toBe(0);

    // Around x = 20, new is below its lower bound (50) → 0.
    const newAtTwenty = newData.find(([x]) => x <= 20 && x >= 15);
    expect(newAtTwenty?.[1]).toBe(0);
  });

  it("falls back to Silverman's rule when fftkde throws on the first attempt", () => {
    // safeKde calls fftkde with the pre-computed numeric bandwidth first;
    // if that throws it retries with 'silverman'.
    (fftkde as jest.Mock).mockImplementation((_data: number[], bw: unknown) => {
      if (typeof bw === 'number') {
        throw new Error('fftkde failed to converge');
      }
      return { x: [10, 20, 30], y: [0.1, 0.2, 0.3], bandwidth: 1 };
    });

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={true}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const bandwidthArgs = (fftkde as jest.Mock).mock.calls.map(
      (call) => call[1] as string,
    );
    expect(bandwidthArgs).toContain('silverman');

    // The fallback output still drives a populated series.
    const option = getLatestEChartsOption();
    const series = option.series as LineSeriesOption[];
    expect(series[0].data as unknown[]).toHaveLength(1024);
  });

  it('renders both series when one side is empty', () => {
    // newValues=[] hits the computeStatisticsForRuns early-return guard and
    // skips the KDE for that side entirely.
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2, 3]}
        newValues={[]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const option = getLatestEChartsOption();
    const allSeries = option.series as LineSeriesOption[];
    // Mode-overlay markLine series share names with the parent KDE lines
    // (Base/New) so the legend can toggle them together — identify the
    // underlying KDE curves by the absence of a markLine config.
    const series = allSeries.filter(
      (s) => s.type === 'line' && !(s as { markLine?: unknown }).markLine,
    );
    expect(series).toHaveLength(2);
    // Base side has a resampled density curve.
    expect(series[0].data as unknown[]).toHaveLength(1024);
    // New side has no KDE — its data array stays empty.
    expect(series[1].data).toEqual([]);
  });

  it('skips chart init when the container ref has no element attached', () => {
    // Stub the chartContainerRef so its `.current` stays null — the init
    // useEffect should early-return without calling echarts' init.
    const stubContainerRef = {} as { current: unknown };
    Object.defineProperty(stubContainerRef, 'current', {
      get: () => null,
      set: () => {
        /* swallow ref assignments so current stays null */
      },
      enumerable: true,
      configurable: true,
    });
    // CommonGraph's first useRef call is for chartContainerRef; only override
    // that one. The second (chartInstanceRef) falls through to real React.
    mockUseRefOverrides.push(stubContainerRef);

    const initMock = echartsInit as jest.Mock;
    initMock.mockClear();

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    expect(initMock).not.toHaveBeenCalled();

    // Drain any leftover override so it can't leak into later tests.
    mockUseRefOverrides.length = 0;
  });

  it('renders both series in a single tooltip block with the unit suffix', () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const formatter = getTooltipFormatter(getLatestEChartsOption());

    const kdeBaseParam: FormatterParam = {
      seriesType: 'line',
      seriesName: 'Base',
      value: [5, 0.1],
      marker: FAKE_BASE_MARKER,
    };
    const kdeNewParam: FormatterParam = {
      seriesType: 'line',
      seriesName: 'New',
      value: [5, 0.2],
      marker: FAKE_NEW_MARKER,
    };

    // Combined (the trigger: 'axis' path): one header, both series' densities.
    expect(formatter([kdeBaseParam, kdeNewParam])).toBe(
      `Value: 5.00 (ms)<br>${FAKE_BASE_MARKER}Base: 0.1000<br>${FAKE_NEW_MARKER}New: 0.2000`,
    );

    // Single-param fallback (defensive normalisation when only one series is at x).
    expect(formatter(kdeBaseParam)).toBe(
      `Value: 5.00 (ms)<br>${FAKE_BASE_MARKER}Base: 0.1000`,
    );
  });

  it('formats x-axis tick labels: 2 dp for fractions, bare integer for whole numbers', () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const option = getLatestEChartsOption();
    const xAxis = (
      option.xAxis as Array<{
        axisLabel: { formatter: (value: number) => string };
      }>
    )[0];
    const format = xAxis.axisLabel.formatter;

    // Values are scaled and formatted to the unit's decimal precision (2dp for ms).
    expect(format(14)).toBe('14.00');
    expect(format(0)).toBe('0.00');
    expect(format(-7)).toBe('-7.00');

    // Fractional values render with 2 decimal places.
    expect(format(48.541)).toBe('48.54');
    expect(format(48.545)).toBe('48.55');
    expect(format(0.1)).toBe('0.10');
    expect(format(-3.14159)).toBe('-3.14');
  });

  it('omits the unit suffix in the tooltip header when unit is null', () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit={null}
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const formatter = getTooltipFormatter(getLatestEChartsOption());

    const rendered = formatter([
      {
        seriesType: 'line',
        seriesName: 'Base',
        value: [5, 0.1],
        marker: '',
        axisValue: 5,
      },
    ]);
    // No "(unit)" suffix after the value when unit is null.
    expect(rendered).toBe('Value: 5.00<br>Base: 0.1000');
  });

  it('emits a mode-overlay markLine series for each detected peak', () => {
    // Strictly increasing fake KDE — fitModesFromKde returns a single peak at
    // the global max (last x). That yields exactly one markLine overlay per
    // series, with a label tagged by series and letter A. Overlays share
    // names with the parent KDE series (Base/New) so the legend can toggle
    // them — identify them by the markLine config rather than name.
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const option = getLatestEChartsOption();
    const series = option.series as Array<{
      name?: string;
      markLine?: {
        data?: Array<{ xAxis?: number }>;
        label?: { formatter?: string };
        lineStyle?: { color?: string };
      };
    }>;
    // Peak overlays are line-type series with a markLine. Scatter rows also
    // carry a baseline markLine but they're scatter-type, so type filters them out.
    const overlays = series.filter(
      (s) => (s as { type?: string }).type === 'line' && Boolean(s.markLine),
    );
    // One overlay per series (Base + New), both peaking at the same x.
    expect(overlays).toHaveLength(2);
    expect(overlays[0].name).toBe('Base');
    expect(overlays[1].name).toBe('New');
    expect(overlays[0].markLine?.data?.[0]?.xAxis).toBe(30);
    expect(overlays[1].markLine?.data?.[0]?.xAxis).toBe(30);
    expect(overlays[0].markLine?.label?.formatter).toMatch(/^Base A: 30/);
    expect(overlays[1].markLine?.label?.formatter).toMatch(/^New A: 30/);
  });

  it('shows raw run values in the scatter tooltip with the unit suffix', () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const formatter = getTooltipFormatter(getLatestEChartsOption());
    // The formatter inspects items[0].seriesType to pick between scatter and
    // KDE rendering — pass a scatter-shaped item to exercise the scatter path.
    const rendered = formatter([
      {
        seriesType: 'scatter',
        seriesName: 'Base',
        value: [12.5, 0],
        marker: '[m]',
      },
    ] as unknown as Parameters<typeof formatter>[0]);
    expect(rendered).toBe('[m]Base: 12.50 (ms)');
  });

  it("labels the scatter y-axis as 'Base' for 1 and 'New' for 0", () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    const option = getLatestEChartsOption();
    const yAxes = option.yAxis as Array<{
      axisLabel?: { formatter?: (v: number) => string };
    }>;
    const scatterYAxisFormatter = yAxes[1]?.axisLabel?.formatter;
    expect(scatterYAxisFormatter).toBeDefined();
    expect(scatterYAxisFormatter!(1)).toBe('Base');
    expect(scatterYAxisFormatter!(0)).toBe('New');
    // Anything else returns empty so intermediate jitter values stay unlabelled.
    expect(scatterYAxisFormatter!(0.5)).toBe('');
  });

  it('wires the slider through both onChange (local) and onChangeCommitted (parent)', () => {
    // The slider uses MUI's two-event API: onChange updates a local mirror for
    // the thumb/percentage during drag, and onChangeCommitted pushes the final
    // value up. fireEvent.change on the underlying <input type="range"> drives
    // both — confirming both handlers are wired correctly.
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));
    const onVtChange = jest.fn();

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={onVtChange}
        showModes={true}
        onShowModesChange={jest.fn()}
      />,
    );

    // Starts at vt = 0.5 → 50%.
    expect(screen.getByText('50%')).toBeInTheDocument();

    const slider = screen.getByRole('slider', { name: /valley depth/i });
    fireEvent.change(slider, { target: { value: '0.7' } });

    // Local mirror updated → percentage reflects the new value.
    expect(screen.getByText('70%')).toBeInTheDocument();
    // Parent committed callback also fired with the same value.
    expect(onVtChange).toHaveBeenCalledWith(0.7);
  });

  it('disables the slider when showModes is false', () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={false}
        onShowModesChange={jest.fn()}
      />,
    );

    const slider = screen.getByRole('slider', { name: /valley depth/i });
    expect(slider).toBeDisabled();
  });

  it('calls onShowModesChange when the Show modes checkbox is toggled', () => {
    (fftkde as jest.Mock).mockImplementation(() => ({
      x: [10, 20, 30],
      y: [0.1, 0.2, 0.3],
      bandwidth: 1,
    }));
    const onShowModesChange = jest.fn();

    render(
      <CommonGraph
        baseValues={[1, 2]}
        newValues={[3, 4]}
        unit='ms'
        isSubtest={false}
        vt={0.5}
        onVtChange={jest.fn()}
        showModes={true}
        onShowModesChange={onShowModesChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /show modes/i });
    fireEvent.click(checkbox);
    expect(onShowModesChange).toHaveBeenCalledWith(false);
  });
});
