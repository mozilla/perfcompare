import { Box } from '@mui/system';

import { capitalize } from '../../utils/helpers';

interface PValCliffsDeltaCompProps {
  cliffs_delta: number;
  cliffs_interpretation: string;
  pValue: number | undefined | null;
  p_value_cles: string;
  cles: number | string;
  cles_direction: string;
}

function PValCliffsDeltaComp(props: PValCliffsDeltaCompProps) {
  const {
    cliffs_delta,
    cliffs_interpretation,
    pValue,
    p_value_cles,
    cles,
    cles_direction,
  } = props;
  return (
    <Box
      sx={{
        backgroundColor: 'manWhitneyComps.background',
        padding: 1,
        borderRadius: '5px',
        width: '100%',
      }}
    >
      <table
        style={{ borderCollapse: 'collapse', width: '100%', marginTop: 8 }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Metric</th>
            <th style={{ textAlign: 'left', paddingRight: 16 }}>Value</th>
            <th style={{ textAlign: 'left' }}>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: 2 }}>{`Cliff's Delta`}</td>
            <td style={{ padding: 2 }}>{cliffs_delta}</td>
            <td style={{ padding: 2 }}>
              {capitalize(cliffs_interpretation ?? '')}
            </td>
          </tr>
          <tr>
            <td style={{ padding: 2 }}>Significance (p-value)</td>
            <td style={{ padding: 2 }}>{pValue}</td>
            <td style={{ padding: 2 }}>{p_value_cles}</td>
          </tr>
          <tr>
            <td style={{ padding: 2 }}>CLES</td>
            <td style={{ padding: 2 }}>{cles}</td>
            <td style={{ padding: 2 }}>{capitalize(cles_direction ?? '')}</td>
          </tr>
        </tbody>
      </table>
    </Box>
  );
}
export default PValCliffsDeltaComp;
