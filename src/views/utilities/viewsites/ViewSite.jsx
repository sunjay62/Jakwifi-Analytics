import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import './viewsite.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Table, Spin, Space } from 'antd';
import axiosNew from 'api/axiosNew';
import axios from 'axios';
import dayjs from 'dayjs';
import { BackwardOutlined } from '@ant-design/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker } from 'antd';
import utcPlugin from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';
import 'dayjs/locale/en';

dayjs.extend(customParseFormat);
dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
const { RangePicker } = DatePicker;

const ViewSite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedDateRange] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDate2, setStartDate2] = useState(null);
  const [endDate2, setEndDate2] = useState(null);

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
        console.log(res.data);
        setName(res.data.name);
        setIp(res.data.public_ip);
        setTableLoading(false);
      })
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (endDate === null) {
          return;
        }

        const apiUrl = 'http://localhost:4000/api/elastiflow';
        const requestBody = {
          size: 0,
          query: {
            bool: {
              filter: [
                {
                  term: {
                    'client.ip.keyword': ip
                  }
                },
                {
                  range: {
                    '@timestamp': {
                      gte: startDate,
                      lte: endDate,
                      format: 'strict_date_optional_time'
                    }
                  }
                },
                {
                  terms: {
                    'destination.port': [443, 80]
                  }
                },
                {
                  term: {
                    'network.transport': 'tcp'
                  }
                }
              ]
            }
          },
          aggs: {
            top_server: {
              terms: {
                field: 'server.domain.keyword',
                size: 10,
                order: {
                  _count: 'desc'
                }
              },
              aggs: {
                sum_network_packet: {
                  sum: {
                    field: 'network.packets'
                  }
                },
                sum_network_bytes: {
                  sum: {
                    field: 'network.bytes'
                  }
                },
                service_names: {
                  terms: {
                    field: 'flow.service_name.keyword',
                    size: 10,
                    order: {
                      _count: 'desc'
                    }
                  }
                },
                as_organization: {
                  significant_text: {
                    field: 'destination.as.organization.name.keyword'
                  }
                }
              }
            }
          }
        };

        const response = await axios.post(apiUrl, requestBody);

        const data = response.data.aggregations.top_server.buckets;
        const keysArray = response.data.aggregations.top_server.buckets.map((bucket) => bucket.key);
        console.log(response.data);
        const formattedData = data.map((item) => {
          const asOrgBuckets = item.as_organization?.buckets || [];
          const firstAsOrgBucket = asOrgBuckets[0] || {};
          const keyApp = firstAsOrgBucket.key || `No Name`;
          const keysArray = item.key || `No Name`;
          const port = item.service_names?.buckets?.map((serviceItem) => serviceItem.key).join(', ') || 'No Service Port';

          return {
            keyApp: keyApp,
            keysArray: keysArray,
            doc_count: item.doc_count,
            sum_network_bytes: item.sum_network_bytes.value,
            sum_network_packet: item.sum_network_packet.value,
            service_names: port
          };
        });
        console.log(keysArray);
        setTableLoading(false);
        setTableData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTableLoading(false);
      }
    };

    fetchData();
  }, [ip, startDate, endDate]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' MB';
    } else {
      const gbValue = (bytes / 1024).toFixed(2);
      return gbValue % 1 === 0 ? parseInt(gbValue) + ' GB' : gbValue + ' GB';
    }
  };

  const columns = [
    {
      title: 'No',
      dataIndex: 'index',
      id: 'index',
      render: (text, record, index) => index + 1
    },
    {
      title: 'Application',
      dataIndex: 'keyApp',
      id: 'keyApp'
    },
    {
      title: 'Service Names',
      dataIndex: 'keysArray',
      id: 'keysArray',
      width: 70
    },
    {
      title: 'Total Bytes',
      dataIndex: 'sum_network_bytes',
      id: 'sum_network_bytes',
      width: 100,
      render: (bytes) => formatBytes(bytes)
    },
    {
      title: 'Total Packets',
      dataIndex: 'sum_network_packet',
      id: 'sum_network_packet'
    },
    {
      title: 'Port Services',
      dataIndex: 'service_names',
      id: 'service_names',
      render: (port) => port || 'No Service Names'
    },
    {
      title: 'Total Counts',
      dataIndex: 'doc_count',
      id: 'doc_count'
    }
  ];

  const handleDateChange = (dates, dateStrings) => {
    // Convert selected dates to Day.js objects
    const startDateTime = dayjs.utc(dateStrings[0]);
    const endDateTime = dayjs.utc(dateStrings[1]);

    // Subtract 7 hours from the selected dates
    const adjustedStartDateTime = startDateTime.subtract(7, 'hour');
    const adjustedEndDateTime = endDateTime.subtract(7, 'hour');

    // Format adjusted dates for sending
    const formattedStartDate = adjustedStartDateTime.format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
    const formattedEndDate = adjustedEndDateTime.format('YYYY-MM-DDTHH:mm:ss') + '.000Z';

    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    console.log(formattedStartDate);
    console.log(formattedEndDate);

    const formattedDates2 = dateStrings.map((date) => {
      const formattedDate2 = dayjs.utc(date).format('YYYY-MM-DD HH:mm:ss');
      return formattedDate2;
    });

    setStartDate2(formattedDates2[0]);
    setEndDate2(formattedDates2[1]);

    console.log(formattedDates2[0]);
    console.log(formattedDates2[1]);
  };

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
            <tr>
              <th>ID</th>
              <td>{id}</td>
            </tr>
            <tr>
              <th>Name Site</th>
              <td>{name}</td>
            </tr>
            <tr>
              <th>IP Publik</th>
              <td>{ip}</td>
            </tr>
          </table>
          <div className="dataDate">
            <p>Range Date :</p>
            <Space>
              <RangePicker
                showTime={{
                  hideDisabledOptions: true
                }}
                value={selectedDateRange}
                onChange={handleDateChange}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Space>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className="containerTable">
            <h3>TOP 10 Explore Connections</h3>
            <div className="containerReport">
              <div className="containerDate">
                <p>From : {startDate2}</p>
                <p>To : {endDate2}</p>
              </div>
            </div>
          </div>
          {tableLoading ? (
            <div className="loadingContainer">
              <Space
                direction="vertical"
                style={{
                  width: '100%'
                }}
              >
                <Spin spinning={tableLoading} tip="Loading" size="large">
                  <Table dataSource={tableData} columns={columns} />
                </Spin>
              </Space>
            </div>
          ) : (
            <Table dataSource={tableData} columns={columns} />
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewSite;
