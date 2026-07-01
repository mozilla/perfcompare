import {
  buildCompareBenchmarkUrl,
  buildSingleProfileUrl,
  buildTaskArtifactUrl,
  SPEEDOMETER3_PROFILE_ARTIFACT,
} from '../../components/CompareResults/ProfileCompare/urls';

describe('ProfileCompare url helpers', () => {
  it('builds a Taskcluster artifact URL', () => {
    expect(
      buildTaskArtifactUrl(
        'eSFQ0OC9R665QYfdgtWgKA',
        0,
        SPEEDOMETER3_PROFILE_ARTIFACT,
      ),
    ).toBe(
      'https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/eSFQ0OC9R665QYfdgtWgKA/runs/0/artifacts/public/test_info/profile_speedometer3_compact.jslb.gz',
    );
  });

  it('builds a single-profile URL that decodes to the raw artifact URL', () => {
    const url = buildSingleProfileUrl('eSFQ0OC9R665QYfdgtWgKA', 0);
    expect(url).toBe(
      'https://profiler.firefox.com/from-url/https%3A%2F%2Ffirefox-ci-tc.services.mozilla.com%2Fapi%2Fqueue%2Fv1%2Ftask%2FeSFQ0OC9R665QYfdgtWgKA%2Fruns%2F0%2Fartifacts%2Fpublic%2Ftest_info%2Fprofile_speedometer3_compact.jslb.gz',
    );
  });

  it('builds a compare-benchmark URL with both profiles', () => {
    const base = buildSingleProfileUrl('CVdpkviXTEyAJH37VBMTGQ', 0);
    const cmp = buildSingleProfileUrl('IUYZmFShTXSjbSgQqRQ0JQ', 0);
    const url = buildCompareBenchmarkUrl(base, cmp);
    // The `profiles[]` parameter should appear twice and the inner URLs
    // should be double-encoded (the outer URLSearchParams encoding wrapping
    // the from-url URL, which itself contains an encoded task artifact URL).
    expect(url).toBe(
      'https://deploy-preview-6012--perf-html.netlify.app/compare-benchmark/?' +
        'profiles%5B%5D=https%3A%2F%2Fprofiler.firefox.com%2Ffrom-url%2Fhttps%253A%252F%252Ffirefox-ci-tc.services.mozilla.com%252Fapi%252Fqueue%252Fv1%252Ftask%252FCVdpkviXTEyAJH37VBMTGQ%252Fruns%252F0%252Fartifacts%252Fpublic%252Ftest_info%252Fprofile_speedometer3_compact.jslb.gz' +
        '&profiles%5B%5D=https%3A%2F%2Fprofiler.firefox.com%2Ffrom-url%2Fhttps%253A%252F%252Ffirefox-ci-tc.services.mozilla.com%252Fapi%252Fqueue%252Fv1%252Ftask%252FIUYZmFShTXSjbSgQqRQ0JQ%252Fruns%252F0%252Fartifacts%252Fpublic%252Ftest_info%252Fprofile_speedometer3_compact.jslb.gz',
    );
  });
});
