import React, { useState, useEffect } from 'react';
import { Spin, Space, AutoComplete } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import TroubleshootOutlinedIcon from '@mui/icons-material/TroubleshootOutlined';
import axiosPrefix from '../../../api/axiosPrefix';
import './analytics.scss';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  const viewSite = (id) => {
    setId(id);
    navigate(`/jakwifi/analytics/viewsite/${id}`);
  };

  // INI UNTUK GET DATA UPDATE
  useEffect(() => {
    axiosPrefix
      .get(`/sites/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log(res.data);
        setLoading(false);
        setId(res.data.id);
        setNameEdit(res.data.name);
        setIpEdit(res.data.public_ip);
      })
      .catch((err) => console.log(err));
  }, [id]);

  // API GET DATA SITE

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosPrefix.get('/sites', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // console.log(response.data);
        setLoading(false);
        setUsers(response.data.data);
        // isMounted && setUsers(response.data.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'name', headerName: 'Site Name', flex: 3 },
    { field: 'public_ip', headerName: 'IP Public', flex: 1 }
  ];

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="View Analytics" arrow>
                <div className="viewButtonOperator">
                  <TroubleshootOutlinedIcon className="viewIcon" onClick={() => viewSite(rowData.id)} />
                </div>
              </Tooltip>
            </div>
          </>
        );
      }
    }
  ];

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  // Autocomplete search event handler
  const handleSearch = (value) => {
    if (value === '' || value === null) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => user.name.toLowerCase().includes(value.toLowerCase()) || user.public_ip.includes(value));
      setFilteredUsers(filtered);
    }
  };

  const onSelect = (value) => {
    const selectedUser = users.find((user) => user.name.toLowerCase() === value.toLowerCase() || user.public_ip.includes(value));

    setFilteredUsers(selectedUser ? [selectedUser] : []);
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>JakWifi Analytics</h2>
            <AutoComplete
              className="autocomplete"
              style={{ width: 250 }}
              placeholder="Search"
              onSelect={onSelect}
              onSearch={handleSearch}
            />
          </div>
        </Grid>
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
              columns={columnSites.concat(actionColumn)}
              rows={addIndex(filteredUsers.length > 0 ? filteredUsers : users)}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 }
                }
              }}
              pageSizeOptions={[5, 10, 50, 100]}
            />
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Analytics;
