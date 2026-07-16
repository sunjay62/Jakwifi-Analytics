import React from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { Grid, Typography } from '@mui/material';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { Space, Spin } from 'antd';
import { useMonthlyReport } from './MonthlyReportProvider';

// Chart data

const TotalGrowthBarChart = ({ isLoading }) => {
  const {
    loading,
    growthChart: { bwUsageData, dataDevice, monthYearData }
  } = useMonthlyReport();

  const series = [
    {
      name: 'BW Usage ',
      data: bwUsageData
    },
    {
      name: 'Device Connected ',
      data: dataDevice
    }
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false // Menghilangkan toolbar yang berisi menu download
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: monthYearData
    },
    fill: {
      opacity: 1
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return Math.round(val);
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex }) {
          if (seriesIndex === 0) {
            if (typeof val === 'string' && val.includes('P')) {
              return val;
            }
            return val + ' P';
          } else if (seriesIndex === 1) {
            return val + ' Device';
          }
          return val;
        }
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Typography variant="h4">Total BW Usage & Device Connected</Typography>
            </Grid>
            <Grid item xs={12}>
              {loading ? (
                <div className="loadingContainer">
                  <Space
                    direction="vertical"
                    style={{
                      width: '100%',
                      height: '50vh',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <Spin tip="Loading" size="large">
                      <div className="content" />
                    </Spin>
                  </Space>
                </div>
              ) : (
                <div id="chart">
                  <ReactApexChart options={options} series={series} type="bar" height={520} />
                </div>
              )}
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;
