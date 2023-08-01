import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import './viewsite.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Table, Spin, Space } from 'antd';
import axiosNew from 'api/axiosNew';
import axios from 'axios';

const ViewSite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

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
        const apiUrl = 'http://localhost:4000/api/elastiflow'; // Update with your API URL
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
                      gte: '2023-08-01T00:00:00.000Z',
                      lte: '2023-08-01T00:15:00.000Z',
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
            score: firstAsOrgBucket.score || 0,
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
  }, [ip]);

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
      key: 'index',
      render: (text, record, index) => index + 1
    },
    {
      title: 'Application',
      dataIndex: 'keyApp',
      key: 'keyApp'
    },
    {
      title: 'Doc Count',
      dataIndex: 'doc_count',
      key: 'doc_count'
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score'
    },
    {
      title: 'Total Bytes',
      dataIndex: 'sum_network_bytes',
      key: 'sum_network_bytes',
      width: 100,
      render: (bytes) => formatBytes(bytes)
    },
    {
      title: 'Total Packets',
      dataIndex: 'sum_network_packet',
      key: 'sum_network_packet'
    },
    {
      title: 'Service Names',
      dataIndex: 'keysArray',
      key: 'keysArray'
    },
    {
      title: 'Port Services',
      dataIndex: 'service_names',
      key: 'service_names',
      render: (port) => port || 'No Service Names'
    }
  ];

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>JakWifi Analytics</h2>
            <Button type="primary" onClick={handleBack}>
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12}>
          <p>ID : {id}</p>
          <p>Name Site : {name}</p>
          <p>IP Publik : {ip}</p>
        </Grid>
        <Grid item xs={12}>
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
