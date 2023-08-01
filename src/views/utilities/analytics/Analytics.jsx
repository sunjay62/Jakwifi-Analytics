import React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';

const Analytics = () => {
  return (
    <>
      <MainCard>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <SubCard>
              <div className="cardHeader">
                <h3>BW Usage & Device Connected</h3>
                <div className="btnMenu"></div>
              </div>
              <div>
                <div id="chart"></div>
              </div>
            </SubCard>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default Analytics;
