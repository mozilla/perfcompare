import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/loader';
import SubtestsRevisionRow from '../../components/CompareResults/SubtestsResults/SubtestsRevisionRow';
import getTestData from '../utils/fixtures';
import { screen, renderWithRouter } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  fetchMock
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [],
    });

  return renderWithRouter(component, {
    route: '/subtests-compare-results/',
    search: '?baseRev=spam&baseRepo=try&framework=1',
    loader,
  });
}

describe('SubtestsRevisionRow Component', () => {
  it('renders the component with correct data', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
      />,
    );

    // Check if all elements render correctly
    await screen.findByText('dhtml.html');
    expect(await screen.findByText('971.38 ms')).toBeInTheDocument();
    expect(await screen.findByText('982.41 ms')).toBeInTheDocument();
    expect(await screen.findByText('1.14 %')).toBeInTheDocument();
    expect(await screen.findByText('Low')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('renders the Regression status with bg color', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[2]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
      />,
    );

    // Check if all elements render correctly
    await screen.findByText('regression.html');
    expect(await screen.findByText('Regression')).toBeInTheDocument();
  });

  it('renders the Improvement status with bg color', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[3]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
      />,
    );

    // Check if all elements render correctly
    await screen.findByText('improvement.html');
    expect(await screen.findByText('Improvement')).toBeInTheDocument();
  });

  it('renders browser name when base and new apps are different', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[4]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
      />,
    );

    // wait until all elements render correctly
    await screen.findByText('browser.html');

    expect(document.body).toMatchSnapshot();
    expect(await screen.findByText(/firefox/i)).toBeInTheDocument();
    expect(await screen.findByText(/chrome/i)).toBeInTheDocument();
  });

  it('renders doesnt render browser name when base and new apps are firefox or fenix', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
      />,
    );

    // wait until all elements render correctly
    await screen.findByText('dhtml.html');

    expect(document.body).toMatchSnapshot();
    expect(screen.queryByText(/firefox/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/chrome/i)).not.toBeInTheDocument();
  });
});
