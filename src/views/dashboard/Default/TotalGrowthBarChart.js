import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { Grid, Typography } from '@mui/material';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axios from 'axios';

// Chart data

const TotalGrowthBarChart = ({ isLoading }) => {
  const [bwUsageData, setBWUsageData] = useState([]);
  const [dataDevice, setDataDevice] = useState([]);

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
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des']
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: (val) => val + ' P'
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
    const [value, unit] = bandwidth.split(' ');
    if (unit === 'G') {
      return parseFloat(value);
    } else if (unit === 'T') {
      return parseFloat(value) * 1024; // 1 Terabyte = 1024 Gigabyte
    }
    return 0;
  };

  useEffect(() => {
    const fetchDataForMonthYear = async (month, year) => {
      const endpoint = `http://172.16.25.50:8080/ngasal/report/monthly/${month}/${year}/darat/raw/`;

      try {
        const response = await axios.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const totalBandwidth = response.data.reduce((total, item) => total + convertBandwidthToNumber(item.bandwidth), 0);
        return totalBandwidth;
      } catch (error) {
        console.error(`Error fetching data for ${year}-${month}:`, error);
        return 0;
      }
    };

    const fetchDataForLast12Months = async () => {
      const currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      let currentYear = currentDate.getFullYear();

      const totalBandwidths = [];
      for (let i = 0; i < 12; i++) {
        if (currentMonth === 0) {
          currentMonth = 12;
          currentYear--;
        }

        const totalBandwidth = await fetchDataForMonthYear(currentMonth, currentYear);
        totalBandwidths.push(totalBandwidth);

        // console.log(`${formatBandwidth(totalBandwidth)} `);

        currentMonth--;
      }

      const formattedData = totalBandwidths.map((bw) => formatBandwidth(bw));
      setBWUsageData(formattedData);
    };

    fetchDataForLast12Months();
  }, []);

  useEffect(() => {
    const fetchDataForMonthYear = async (month, year) => {
      const endpoint = `http://172.16.25.50:8080/ngasal/report/monthly/${month}/${year}/darat/raw/`;

      try {
        const response = await axios.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Menghitung total data device dengan menjumlahkan semua devicenya
        const totalDataDevice = response.data.reduce((total, item) => total + item.device, 0);
        return totalDataDevice;
      } catch (error) {
        console.error(`Error fetching data for ${year}-${month}:`, error);
        return 0;
      }
    };

    const formatValue = (value) => {
      if (value >= 1e9) {
        return (value / 1e9).toFixed(3) + ' RB';
      } else {
        const stringValue = value.toLocaleString('en-US', { minimumFractionDigits: 0 });
        const formattedValue = stringValue.slice(0, -3);
        return formattedValue;
      }
    };

    const fetchDataForLast12Months = async () => {
      const currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      let currentYear = currentDate.getFullYear();

      const totalDataDevices = [];
      for (let i = 0; i < 12; i++) {
        if (currentMonth === 0) {
          currentMonth = 12;
          currentYear--;
        }

        const totalDataDevice = await fetchDataForMonthYear(currentMonth, currentYear);
        totalDataDevices.push(totalDataDevice);

        console.log(`${formatValue(totalDataDevice)}`);

        currentMonth--;
      }

      setDataDevice(totalDataDevices);
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
              <div id="chart">
                <ReactApexChart options={options} series={series} type="bar" height={520} />
              </div>
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
