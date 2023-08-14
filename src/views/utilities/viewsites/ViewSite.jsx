import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { gridSpacing } from 'store/constant';
import './viewsite.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown, Button, Spin, Space } from 'antd';
import axiosNew from 'api/axiosNew';
import axios from 'axios';
import dayjs from 'dayjs';
import { BackwardOutlined } from '@ant-design/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);

const ViewSite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // const [startDate2, setStartDate2] = useState(null);
  // const [endDate2, setEndDate2] = useState(null);
  const [seriesApp, setSeriesApp] = useState([]);
  const [optionsApp, setOptionsApp] = useState({
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
    const fifteenMinutesAgo = dayjs().subtract(1380, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

    setStartDate(fifteenMinutesAgo);
    setEndDate(currentTime);
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = 'http://101.255.0.53:5000/netflow-ui/data/statistic/search';
        const requestBody = {
          end_datetime: endDate,
          src_ip_address: ip,
          start_datetime: startDate
        };
        console.log('Request Body:', requestBody);
        const response = await axios.post(apiUrl, requestBody);
        console.log(response.data);

        const dataArray = response.data.data;

        console.log(dataArray);

        const formattedData = dataArray.map((item, index) => ({
          id: index,
          index: item.index,
          keyApp: item.application,
          keysArray: item.dst_as_name,
          total: item.total,
          total_formatted: formatBytes(item.total),
          download: formatBytes(item.download),
          upload: formatBytes(item.upload),
          service_names: item.protocol_service_name,
          packet_total: item.packet_total
        }));

        const mergedData = {};

        formattedData.forEach((item) => {
          if (!mergedData[item.keyApp]) {
            mergedData[item.keyApp] = {
              applications: item.keyApp,
              counts: item.packet_total,
              total: item.total
            };
          }

          if (!optionsApp.labels.includes(item.keyApp)) {
            optionsApp.labels.push(item.keyApp);
          }
        });

        setOptionsApp(optionsApp);

        const mergedSeriesBw = Object.values(mergedData);

        mergedSeriesBw.forEach(() => {
          setSeriesApp(mergedSeriesBw.map((item) => item.total));
          console.log(mergedSeriesBw.map((item) => item.total));
        });

        setLoading(false);
        setTableData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
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
      field: 'keyApp',
      flex: 1.5
    },
    {
      headerName: 'Service Names',
      field: 'keysArray',
      flex: 1.5
    },
    {
      headerName: 'Port Services',
      field: 'service_names',
      flex: 1
    },
    {
      headerName: 'Download',
      field: 'download',
      flex: 0.8
    },
    {
      headerName: 'Upload',
      field: 'upload',
      flex: 0.8
    },
    {
      headerName: 'Total Bandwidth',
      field: 'total_formatted',
      flex: 1.2
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
      item.no = index + 1;
      return item;
    });
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const startDateTime = dates[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const endDateTime = dates[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');

      setStartDate(startDateTime);
      setEndDate(endDateTime);
    }
  };

  const downloadPDF = () => {
    console.log('Download PDF');
  };
  const downloadExcel = () => {
    console.log('Download Excel');
  };
  const downloadCSV = () => {
    console.log('Download CSV');
  };
  const downloadChart = () => {
    console.log('Download Chart');
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
          <div className="dataDate">
            <p>Range Date :</p>
            <Space>
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
              <RangePicker value={selectedDateRange} onChange={handleDateChange} format="YYYY-MM-DD HH:mm:ss" />
            </Space>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className="containerTable">
            <h3>TOP 10 Explore Connections</h3>
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
            <div className="containerDate">
              {/* <p>From : {startDate2}</p>
              <p>To : {endDate2}</p> */}
            </div>
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
                  <Spin tip="Loading" size="large">
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
            <div className="containerApexChart">
              <div id="chart" className="chartDonut">
                <h4>Top 10 Applications</h4>
                <ReactApexChart options={optionsApp} series={seriesApp} type="donut" />
              </div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewSite;
