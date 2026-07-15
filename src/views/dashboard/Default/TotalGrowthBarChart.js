import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { Grid, Typography } from '@mui/material';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { Space, Spin } from 'antd';
import axiosNgasal from 'api/axiosNgasal';

// Chart data

const TotalGrowthBarChart = ({ isLoading }) => {
  const [bwUsageData, setBWUsageData] = useState([]);
  const [dataDevice, setDataDevice] = useState([]);
  const [monthYearData, setMonthYearData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fungsi utilitas untuk mengonversi bandwidth ke bilangan (dalam Gigabyte atau Terabyte)
  const formatBandwidth = (value) => {
    const units = ['T', 'P', 'E'];
    let formattedValue = value;
    let unitIndex = 0;

    while (formattedValue >= 1024 && unitIndex < units.length) {
      formattedValue /= 1024;
      unitIndex++;
    }

    return formattedValue.toFixed(1) + ' ' + units[unitIndex];
  };

  const convertBandwidthToNumber = (bandwidth) => {
    if (typeof bandwidth !== 'string') {
      return 0;
    }
    const [value, unit] = bandwidth.split(' ');
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 0;
    }
    // Nilai selalu dikembalikan dalam satuan Gigabyte
    switch (unit) {
      case 'TB':
        return numValue * 1024;
      case 'GB':
        return numValue;
      case 'MB':
        return numValue / 1024;
      case 'KB':
        return numValue / 1024 / 1024;
      case 'B':
        return numValue / 1024 / 1024 / 1024;
      default:
        return 0;
    }
  };

  const getMonthName = (month) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1];
  };

  useEffect(() => {
    const fetchDataForMonthYear = async (month, year) => {
      const endpoint = `/ngasal/report/monthly/${month}/${year}/darat/raw/`;

      try {
        const response = await axiosNgasal.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log(`[${year}-${month}] data didapat:`, response.data);

        const totalBandwidth = response.data.reduce((total, item) => total + convertBandwidthToNumber(item.bandwidth), 0);
        const totalDataDevice = response.data.reduce((total, item) => total + item.device, 0);
        return { totalBandwidth, totalDataDevice };
      } catch (error) {
        console.error(`Error fetching data for ${year}-${month}:`, error);
        return { totalBandwidth: 0, totalDataDevice: 0 };
      }
    };

    const fetchDataForLast12Months = async () => {
      const currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      let currentYear = currentDate.getFullYear();

      const monthYearPairs = [];
      for (let i = 0; i < 1; i++) {
        if (currentMonth === 0) {
          currentMonth = 12;
          currentYear--;
        }
        monthYearPairs.unshift({ month: currentMonth, year: currentYear });
        currentMonth--;
      }

      const results = await Promise.all(monthYearPairs.map(({ month, year }) => fetchDataForMonthYear(month, year)));
      const monthYearStrings = monthYearPairs.map(({ month, year }) => `${getMonthName(month)} ${year}`);

      setMonthYearData(monthYearStrings);
      setBWUsageData(results.map(({ totalBandwidth }) => formatBandwidth(totalBandwidth)));
      setDataDevice(results.map(({ totalDataDevice }) => totalDataDevice));
      setLoading(false);
    };

    fetchDataForLast12Months();
  }, []);

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
