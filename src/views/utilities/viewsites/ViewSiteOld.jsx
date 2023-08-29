import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { gridSpacing } from 'store/constant';
import './viewsite.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown, Button, Spin, Space, Select } from 'antd';
import axiosNew from 'api/axiosNew';
import axios from 'axios';
import dayjs from 'dayjs';
import { BackwardOutlined } from '@ant-design/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
// import { Chart } from 'chart.js/auto';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);

const ViewSite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedDateRange] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState(null);
  const [seriesUsage, setSeriesUsage] = useState([]);
  const [optionUsage, setOptionUsage] = useState({
    chart: {
      type: 'donut',
      width: '75%',
      height: '40vh'
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return formatBytes(val);
        }
      }
    },

    stroke: {
      colors: ['#fff']
    },
    fill: {
      opacity: 0.8
    },
    legend: {
      position: 'bottom'
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
            height: 100
          },
          legend: {
            position: 'center'
          }
        }
      }
    ],
    labels: []
  });

  const [seriesApp, setSeriesApp] = useState([]);
  const [optionApp, setOptionApp] = useState({
    chart: {
      type: 'donut',
      width: '75%',
      height: '40vh'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%' // Mengatur cutout menjadi 60%
        }
      }
    },
    stroke: {
      colors: ['#fff']
    },
    fill: {
      opacity: 0.8
    },
    legend: {
      position: 'bottom'
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
            height: 100
          },
          legend: {
            position: 'center'
          }
        }
      }
    ],
    labels: []
  });

  const [seriesDst, setSeriesDst] = useState([]);
  const [optionDst, setOptionDst] = useState({
    chart: {
      type: 'donut',
      width: '75%',
      height: '40vh'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%' // Mengatur cutout menjadi 60%
        }
      }
    },
    stroke: {
      colors: ['#fff']
    },
    fill: {
      opacity: 0.8
    },
    legend: {
      position: 'bottom'
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
            height: 100
          },
          legend: {
            position: 'center'
          }
        }
      }
    ],
    labels: []
  });
  const [seriesService, setSeriesService] = useState([]);
  const [optionService, setOptionService] = useState({
    chart: {
      type: 'donut',
      width: '75%',
      height: '40vh'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%' // Mengatur cutout menjadi 60%
        }
      }
    },
    stroke: {
      colors: ['#fff']
    },
    fill: {
      opacity: 0.8
    },
    legend: {
      position: 'bottom'
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
            height: 100
          },
          legend: {
            position: 'center'
          }
        }
      }
    ],
    labels: []
  });

  const handleBack = () => {
    navigate(`/jakwifi/analytics`);
  };

  useEffect(() => {
    axiosNew
      .get(`site/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setName(res.data.name);
        setIp(res.data.public_ip);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    // const fifteenMinutesAgo = dayjs().subtract(1380, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    // const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

    // setStartDate(fifteenMinutesAgo);
    // setEndDate(currentTime);
    const fetchData = async () => {
      // Check if category is empty
      if (!category) {
        toast.error('Please Input Category!');
        return;
      }

      setLoading(true);
      try {
        const apiUrl = 'http://172.16.32.166:5080/netflow-ui/data/statistic/daily';
        const requestBody = {
          category: category,
          end_datetime: endDate,
          src_ip_address: ip,
          start_datetime: startDate
        };
        console.log('Request Body:', requestBody);
        const response = await axios.post(apiUrl, requestBody);
        const dataArray = response.data.data;
        setLastUpdate(response.data.last_update);
        console.log(dataArray);

        const processedDataArray = dataArray.map((item) => {
          if (item.application === null) {
            return { ...item, application: 'No Name' };
          }
          return item;
        });

        // Combine data based on application and sum up totals
        const combinedData = processedDataArray.reduce((accumulator, item) => {
          const existingItem = accumulator.find((accItem) => accItem.application === item.application);
          if (existingItem) {
            existingItem.total += item.total;
          } else {
            accumulator.push({ application: item.application, total: item.total });
          }
          return accumulator;
        }, []);

        // Log the combined data
        // console.log('Combined Data:', combinedData);

        combinedData.sort((a, b) => b.total - a.total);

        // Take the top 10 applications and their corresponding totals
        const topApplications = combinedData.slice(0, 10);
        const extractedApplications = topApplications.map((item) => item.application);
        const extractedTotals = topApplications.map((item) => item.total);

        // console.log(extractedTotals);

        let sum = 0;

        for (let i = 0; i < extractedTotals.length; i++) {
          console.log(`${i}: ${extractedTotals[i]}`);
          sum += extractedTotals[i];
        }

        console.log('Sum:', formatBytes(sum));

        // Update state for optionUsage and SeriesUsage
        setOptionUsage((prevOptions) => ({
          ...prevOptions,
          labels: extractedApplications
        }));

        setSeriesUsage(extractedTotals);

        // Log top 10 applications and their counts
        // console.log('Top 10 Applications:', extractedApplications);
        // console.log('Total Counts for Top 10 Applications:', extractedTotals);

        // Add this console log to extract dst_country values
        const extractedDstCountries = processedDataArray.map((item) => item.dst_country);
        // console.log('Extracted Destination Countries:', extractedDstCountries);
        const extractedProtocol = processedDataArray.map((item) => item.protocol_service_name);
        // console.log('Extracted Protocol:', extractedProtocol);

        // Map values to corresponding names
        const nameMappings = {
          ID: 'IIX',
          SG: 'SDIX'
        };

        // Combine and sum up totals
        const valueTotals = extractedDstCountries.reduce((totals, value) => {
          const normalizedValue = nameMappings[value] || 'INTL';

          if (!totals[normalizedValue]) {
            totals[normalizedValue] = 1;
          } else {
            totals[normalizedValue]++;
          }

          return totals;
        }, {});

        // Process and display the results
        const combinedResults = Object.entries(valueTotals).map(([value, count]) => ({
          value,
          name: value === 'ID' ? 'IIX' : value === 'SG' ? 'SDIX' : value, // Update this line
          count
        }));

        // console.log(combinedResults);

        const extractedNames = combinedResults.map((result) => result.name);
        const extractedCounts = combinedResults.map((result) => result.count);

        setOptionDst({
          ...optionDst,
          labels: extractedNames
        });
        setSeriesDst(extractedCounts);

        // Define protocolNameMappings
        const protocolNameMappings = {
          'TCP/443(http)': 'TCP/443',
          'TCP/80(http)': 'TCP/80',
          'UDP/443(https)': 'UDP/443',
          'TCP/443(https)': 'TCP/443'
          // Add more mappings as needed
        };

        // Create an object to store combined protocol data
        const combinedProtocolData = {};

        // Loop through extractedProtocol array
        extractedProtocol.forEach((protocol) => {
          // Check if the protocol exists in the combinedProtocolData object
          if (combinedProtocolData[protocol]) {
            // If it exists, increment the count
            combinedProtocolData[protocol].count += 1;
          } else {
            // If it doesn't exist, add it with a count of 1
            combinedProtocolData[protocol] = {
              protocol,
              name: protocolNameMappings[protocol] || protocol,
              count: 1
            };
          }
        });

        // Convert the combinedProtocolData object into an array
        const combinedProtocolResults = Object.values(combinedProtocolData);

        const extractedNameService = combinedProtocolResults.map((result) => result.protocol);
        const extractedCountService = combinedProtocolResults.map((result) => result.count);

        setOptionService({
          ...optionService,
          labels: extractedNameService
        });
        setSeriesService(extractedCountService);

        // console.log('Combined Protocol Results:', combinedProtocolResults);

        // After fetching the data and before processing it
        const applicationCounts = {};

        processedDataArray.forEach((item) => {
          const { application } = item;
          if (applicationCounts[application]) {
            applicationCounts[application] += 1;
          } else {
            applicationCounts[application] = 1;
          }
        });

        // Create an array of objects with application and count properties
        const applicationCountsArray = Object.entries(applicationCounts).map(([application, count]) => ({
          application,
          count
        }));

        // Sort the array in descending order based on count
        applicationCountsArray.sort((a, b) => b.count - a.count);

        // Take the top 10 applications and their counts
        const topApplicationsWithCounts = applicationCountsArray.slice(0, 10);

        const extractedAppNames = topApplicationsWithCounts.map((item) => item.application);
        const extractedAppCounts = topApplicationsWithCounts.map((item) => item.count);

        setOptionApp((prevOptions) => ({
          ...prevOptions,
          labels: extractedAppNames
        }));
        setSeriesApp(extractedAppCounts);

        setLoading(false);
        setTableData(processedDataArray);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ip, endDate, startDate]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' Bytes';
    } else if (bytes < 1024 ** 2) {
      const kbValue = (bytes / 1024).toFixed(2);
      return kbValue % 1 === 0 ? parseInt(kbValue) + ' KB' : kbValue + ' KB';
    } else if (bytes < 1024 ** 3) {
      const mbValue = (bytes / 1024 ** 2).toFixed(2);
      return mbValue % 1 === 0 ? parseInt(mbValue) + ' MB' : mbValue + ' MB';
    } else if (bytes < 1024 ** 4) {
      const gbValue = (bytes / 1024 ** 3).toFixed(2);
      return gbValue % 1 === 0 ? parseInt(gbValue) + ' GB' : gbValue + ' GB';
    } else {
      const tbValue = (bytes / 1024 ** 4).toFixed(2);
      return tbValue % 1 === 0 ? parseInt(tbValue) + ' TB' : tbValue + ' TB';
    }
  };

  const columns = [
    {
      field: 'no',
      headerName: 'No',
      width: 50
    },
    {
      headerName: 'Applications',
      field: 'application',
      flex: 1.4
    },
    {
      headerName: 'Dst Addresses',
      field: 'ip_dst_address',
      flex: 1.2
    },
    {
      headerName: 'Port Services',
      field: 'protocol_service_name',
      flex: 1
    },
    {
      headerName: 'Download',
      field: 'download',
      flex: 0.8,
      valueFormatter: (params) => formatBytes(params.value)
    },
    {
      headerName: 'Upload',
      field: 'upload',
      flex: 0.8,
      valueFormatter: (params) => formatBytes(params.value)
    },
    {
      headerName: 'Total Bandwidth',
      field: 'total',
      flex: 1.2,
      valueFormatter: (params) => formatBytes(params.value)
    },
    {
      headerName: 'Total Packets',
      field: 'packet_total',
      flex: 1
    }
  ];

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.id = index + 1; // Assign a unique id to each row
      item.no = index + 1;
      return item;
    });
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const startDateTime = dates[0].startOf('day').format('YYYY-MM-DD');
      const endDateTime = dates[1].endOf('day').format('YYYY-MM-DD');

      setStartDate(startDateTime);
      setEndDate(endDateTime);
    }
  };

  const handleCategory = (value) => {
    console.log(`selected ${value}`);
    setCategory(value);
  };

  const downloadPDF = () => {
    // console.log('Download PDF');
    toast.error('PDF is not ready.');
  };
  const downloadExcel = () => {
    // console.log('Download Excel');
    toast.error('Excel is not ready.');
  };
  const downloadCSV = () => {
    // console.log('Download CSV');
    toast.error('CSV is not ready.');
  };
  const downloadChart = () => {
    // console.log('Download Chart');
    toast.error('Chart is not ready.');
  };

  const onMenuClick = async (e) => {
    const { key } = e;

    switch (key) {
      case '1':
        downloadChart();
        break;
      case '2':
        downloadPDF();
        break;
      case '3':
        downloadExcel();
        break;
      case '4':
        downloadCSV();
        break;
      default:
        break;
    }
  };

  const items = [
    {
      key: '1',
      label: 'Chart',
      icon: <FileImageOutlined />
    },
    {
      key: '2',
      label: 'PDF',
      icon: <FilePdfOutlined />
    },
    {
      key: '3',
      label: 'Excel',
      icon: <FileExcelOutlined />
    },
    {
      key: '4',
      label: 'CSV',
      icon: <FileZipOutlined />
    }
  ];

  // useEffect(() => {
  //   function generateRandomColor(colors) {
  //     const randomIndex = Math.floor(Math.random() * colors.length);
  //     return colors[randomIndex];
  //   }

  //   const colors = [
  //     '#FF63849C',
  //     '#36A2EB9C',
  //     '#FFCE569C',
  //     '#9C27B09C',
  //     '#FF57229C',
  //     '#3F51B59C',
  //     '#CDDC399C',
  //     '#E91E639C',
  //     '#03A9F49C',
  //     '#FF98009C'
  //   ];
  //   const backgroundColors = [];
  //   for (let i = 0; i < 10; i++) {
  //     const randomColor = generateRandomColor(colors);
  //     backgroundColors.push(randomColor);
  //   }

  //   const data = {
  //     labels: ['GOOGLE', 'FACEBOOK', 'GGC-REMALA-CGK', 'Akamai International B.V.', 'ColocationX Ltd.', 'WhatsApp', 'IP Volume inc'],
  //     datasets: [
  //       {
  //         data: [24, 32, 52, 12, 42, 52, 24],
  //         backgroundColor: backgroundColors,
  //         hoverBackgroundColor: backgroundColors,
  //         borderWidth: 1,
  //         cutout: '60%'
  //       }
  //     ]
  //   };

  //   //doughnutLabelsLine

  //   const doughnutLabelsLine = {
  //     id: 'doughnutLabelsLine',
  //     afterDraw(chart) {
  //       const {
  //         ctx,
  //         chartArea: { width, height }
  //       } = chart;

  //       chart.data.datasets.forEach((dataset, i) => {
  //         // console.log(chart.getDatasetMeta(i));
  //         chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
  //           // console.log(chart.data.datasets);
  //           const { x, y } = datapoint.tooltipPosition();

  //           // draw line
  //           const halfwidth = width / 2;
  //           const halfheight = height / 2;

  //           const xLine = x >= halfwidth ? x + 75 : x - 75;
  //           const yLine = y >= halfheight ? y + 10 : y - 10;
  //           const extraLine = x >= halfwidth ? 25 : -25;

  //           const xPercentage = x >= halfwidth ? x + 130 : x - 130;
  //           const yPercentage = y >= halfheight ? y + 32 : y - -12;

  //           // Calculate percentage
  //           const totalValue = dataset.data.reduce((total, value) => total + value, 0);
  //           const percentage = ((dataset.data[index] / totalValue) * 100).toFixed(2) + '%';

  //           // line
  //           ctx.beginPath();
  //           ctx.moveTo(x, y);
  //           ctx.lineTo(xLine, yLine);
  //           ctx.lineTo(xLine + extraLine, yLine);
  //           ctx.strokeStyle = dataset.backgroundColor[index];
  //           ctx.stroke();

  //           //text
  //           ctx.font = '15px Arial';

  //           //control the position
  //           const textXPosition = x >= halfwidth ? 'left' : 'right';
  //           const plusFicePx = x >= halfwidth ? 5 : -5;
  //           ctx.textAlign = textXPosition;
  //           // ctx.fillStyle = dataset.backgroundColor[index];
  //           ctx.fillText(chart.data.labels[index], xLine + extraLine + plusFicePx, yLine);

  //           ctx.fillText(dataset.data[index], xLine + extraLine + plusFicePx, yLine + (x >= halfheight ? 22 : -20));
  //           ctx.fillText(percentage, xPercentage, yPercentage);
  //         });
  //       });
  //     }
  //   };

  //   // Creating the chart instance
  //   const ctx = document.getElementById('doughnutChart').getContext('2d');
  //   const doughnutChart = new Chart(ctx, {
  //     type: 'doughnut',
  //     data: data,
  //     options: {
  //       layout: {
  //         padding: 5
  //       },
  //       maintainAspectRatio: false,
  //       plugins: {
  //         legend: {
  //           display: false
  //         }
  //       }
  //     },
  //     plugins: [doughnutLabelsLine]
  //   });

  //   return () => {
  //     // Clean up the chart when the component unmounts
  //     doughnutChart.destroy();
  //   };
  // }, []);

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>JakWifi Analytics</h2>
            <Button type="primary" onClick={handleBack}>
              <BackwardOutlined />
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12} className="containerData">
          <table className="dataPelanggan">
            <tbody>
              <tr>
                <th>ID</th>
                <td>{id}</td>
              </tr>
              <tr>
                <th>Name Site</th>
                <td>{name}</td>
              </tr>
              <tr>
                <th>IP Public</th>
                <td>{ip}</td>
              </tr>
            </tbody>
          </table>
          <div className="containerSelectRange">
            <Space className="containerRangeDate">
              <p>Range Date :</p>
              {/* <RangePicker
                showTime={{
                  hideDisabledOptions: true,
                  format: 'HH:mm', // Display only hours and minutes
                  minuteStep: 15 // Set minute step to 5
                }}
                value={selectedDateRange}
                onChange={handleDateChange}
                format="YYYY-MM-DD HH:mm"
              /> */}
              <RangePicker value={selectedDateRange} onChange={handleDateChange} format="YYYY-MM-DD" />
            </Space>
            <Space className="containerCategory">
              <p>Category :</p>
              <Select
                showSearch
                placeholder="Select Category"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                onChange={handleCategory}
                options={[
                  {
                    value: 'internet',
                    label: 'Internet'
                  },
                  {
                    value: 'workstation',
                    label: 'Workstation'
                  },
                  {
                    value: 'both',
                    label: 'Both'
                  }
                ]}
              />
            </Space>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className="containerTable">
            <table className="dataDate">
              <tbody>
                <tr>
                  <th>From</th>
                  <td>{startDate}</td>
                </tr>
                <tr>
                  <th>To</th>
                  <td>{endDate}</td>
                </tr>
                <tr>
                  <th>Last Update</th>
                  <td>{lastUpdate}</td>
                </tr>
              </tbody>
            </table>
            <div className="containerReport">
              <div className="containerDownloads">
                <Space direction="vertical">
                  <Dropdown.Button
                    menu={{
                      items,
                      onClick: onMenuClick
                    }}
                  >
                    Downloads
                  </Dropdown.Button>
                </Space>
              </div>
            </div>
          </div>
          <div className="containerList">
            <h3>Table List</h3>
            {/* <div className="containerDate">
              <div className="containerFrom">
                <p>From : {startDate}&nbsp;&nbsp;</p>
                <p>To : {endDate}</p>
              </div>
              <div className="containerUpdate">Last Update : {lastUpdate}</div>
            </div> */}
          </div>
          <Grid item xs={12}>
            {loading ? (
              <div className="loadingContainer">
                <Space
                  direction="vertical"
                  style={{
                    width: '100%'
                  }}
                >
                  <Spin tip="Loading..." size="large">
                    <div className="content" />
                  </Spin>
                </Space>
              </div>
            ) : (
              <DataGrid
                columns={columns}
                rows={addIndex(tableData)}
                getRowId={(row) => row.id}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 }
                  }
                }}
                pageSizeOptions={[5, 10, 50, 100]}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <h3>Chart List</h3>
            <div className="containerChart">
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top 10 BW Usages</h4>
                  {/* <div className="containerDate">
                    <p>From : {startDate}</p>
                    <p>To : {endDate}</p>
                  </div> */}
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionUsage} series={seriesUsage} type="donut" />
                </div>
              </div>
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top 10 Application</h4>
                  {/* <div className="containerDate">
                    <p>From : {startDate}</p>
                    <p>To : {endDate}</p>
                  </div> */}
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionApp} series={seriesApp} type="donut" />
                </div>
              </div>
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top Destination</h4>
                  {/* <div className="containerDate">
                    <p>From : {startDate}</p>
                    <p>To : {endDate}</p>
                  </div> */}
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionDst} series={seriesDst} type="donut" />
                </div>
              </div>
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top Port Service</h4>
                  {/* <div className="containerDate">
                    <p>From : {startDate}</p>
                    <p>To : {endDate}</p>
                  </div> */}
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionService} series={seriesService} type="donut" />
                </div>
              </div>
              {/* <div id="chart" className="containerDonut3">
                <h4>Top Service Usages</h4>
                <div className="chartDonut3">
                  <canvas id="doughnutChart" width="300" height="300"></canvas>
                </div>
              </div> */}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewSite;
