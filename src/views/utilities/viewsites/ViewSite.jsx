import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import './viewsite.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown, Button, Spin, Space, Select, AutoComplete } from 'antd';
import axiosNew from 'api/axiosNew';
import axios from 'axios';
import dayjs from 'dayjs';
import { BackwardOutlined } from '@ant-design/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);

const ViewSite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedDateRange] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState('internet');
  const [seriesUsage, setSeriesUsage] = useState([]);
  const [rows, setRows] = useState([]);
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
    // Get the current date, month, and year
    const currentDate = dayjs();
    const startDateTime = currentDate.startOf('day').format('YYYY-MM-DD');
    const endDateTime = currentDate.endOf('day').format('YYYY-MM-DD');

    setStartDate(startDateTime);
    setEndDate(endDateTime);
    setLoading(true);
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
    const fetchData = async () => {
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

        const processedRows = dataArray.map((item) => {
          return createData(
            item.application,
            item.download,
            item.upload,
            item.total,
            item.packet_total,
            item.ip_dst_address,
            item.ip_src_address,
            item.protocol_service_name,
            item.dst_city
          );
        });

        setRows(processedRows);

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

  // awal code table

  const createData = (
    application,
    download,
    upload,
    total,
    packet_total,
    ip_dst_address,
    ip_src_address,
    protocol_service_name,
    dst_city
  ) => ({
    application,
    download,
    upload,
    total,
    packet_total,
    detail: [
      {
        ip_dst_address,
        ip_src_address,
        protocol_service_name,
        dst_city
      }
    ]
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const Row = (props) => {
    const { row, index } = props;
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{row.application}</TableCell>
          <TableCell align="center">{formatBytes(row.download)}</TableCell>
          <TableCell align="center">{formatBytes(row.upload)}</TableCell>
          <TableCell align="center">{formatBytes(row.total)}</TableCell>
          <TableCell align="center">{row.packet_total}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h4" gutterBottom component="div">
                  Detail
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Dst Address</TableCell>
                      <TableCell align="center">Src Address</TableCell>
                      <TableCell align="center">Service Protocol</TableCell>
                      <TableCell align="center">Destination City</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.detail.map((detailRow) => (
                      <TableRow key={detailRow.ip_dst_address}>
                        <TableCell component="th" scope="row" align="center">
                          {detailRow.ip_dst_address}
                        </TableCell>
                        <TableCell align="center">{detailRow.ip_src_address}</TableCell>
                        <TableCell align="center">{detailRow.protocol_service_name}</TableCell>
                        <TableCell align="center">{detailRow.dst_city}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  // awal fungsi autocomplete filter

  const [searchValue, setSearchValue] = useState('');
  const filteredRows = rows.filter((row) => {
    const application = row.application || '';
    const lowerCasedSearchValue = searchValue?.toLowerCase() || '';

    return application.toLowerCase().includes(lowerCasedSearchValue);
  });

  // akhir fungsi autocomplete filter

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
                value={category}
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
            <div className="dataDateNew">
              <table>
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
            </div>
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
                <AutoComplete
                  className="autocomplete"
                  style={{ width: 250 }}
                  placeholder="Search"
                  value={searchValue}
                  onChange={(value) => setSearchValue(value)}
                />
              </div>
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
                  <Spin tip="Loading..." size="large">
                    <div className="content" />
                  </Spin>
                </Space>
              </div>
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead className="containerTableHead">
                    <TableRow>
                      <TableCell className="tableCell">No</TableCell>
                      <TableCell />
                      <TableCell className="tableCell">Applications</TableCell>
                      <TableCell className="tableCell" align="center">
                        Downloads
                      </TableCell>
                      <TableCell className="tableCell" align="center">
                        Uploads
                      </TableCell>
                      <TableCell className="tableCell" align="center">
                        Total Bandwidths
                      </TableCell>
                      <TableCell className="tableCell" align="center">
                        Total Packets
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <Row key={index} row={row} index={index + page * rowsPerPage} />
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={rows.length}
                  page={page}
                  onPageChange={(event, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
            )}
          </Grid>

          <Grid item xs={12}>
            <h3>Chart List</h3>
            <div className="containerChart">
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top 10 BW Usages</h4>
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionUsage} series={seriesUsage} type="donut" />
                </div>
              </div>
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top 10 Application</h4>
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionApp} series={seriesApp} type="donut" />
                </div>
              </div>
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top Destination</h4>
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionDst} series={seriesDst} type="donut" />
                </div>
              </div>
              <div id="chart" className="containerDonut">
                <div className="chartTop">
                  <h4>Top Port Service</h4>
                </div>
                <div className="chartBottom">
                  <ReactApexChart options={optionService} series={seriesService} type="donut" />
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewSite;
