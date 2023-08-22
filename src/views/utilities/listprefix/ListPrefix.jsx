import React, { useState, useEffect, useRef } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Spin, Space } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import './listprefix.scss';
import { useNavigate } from 'react-router-dom';
import axiosPrefix from '../../../api/axiosPrefix';

const ListPrefix = () => {
  const [asn, setAsn] = useState('');
  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const formRef = useRef(null); // Buat referensi untuk form instance
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    handleSubmit();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const viewSite = (asn) => {
    setAsn(asn);
    navigate(`/custom-prefix/asnumber/viewasnumber/${asn}`);
  };

  // FUNGSI UNTUK UPDATE DATA SETELAH ACTION

  function getApi() {
    const accessToken = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: accessToken
    };
    const fetchAllUsers = async () => {
      try {
        const res = await axiosPrefix.get('/netflow-ui/asn', {
          headers
        });
        setLoading(false);
        setUsers(res.data.data);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchAllUsers();
  }

  // INI API UNTUK CREATE AS NUMBER
  const handleAutoFill = async () => {
    const postData = { asn: asn };
    try {
      const response = await axiosPrefix.post('/netflow-ui/asn/info/number', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setAsn('');
        setLoading(false);
        toast.success('Auto Fill Successfully.');
      }

      console.log(response);
      setAsn(response.data.asn);
      setCountryId(response.data.country_id);
      setCountryName(response.data.country_name);
      setOrganization(response.data.organization_name);
    } catch (error) {
      setLoading(false);
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 409) {
          toast.error('AS Number already exists.');
        } else if (statusCode === 422) {
          toast.error('Please Input AS Number.');
        } else {
          toast.error('Failed to register, please try again.');
        }
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  // INI API UNTUK CREATE AS NUMBER
  const handleSubmit = async () => {
    const postData = { asn: asn, country_id: countryId, country_name: countryName, organization_name: organization };
    try {
      const response = await axiosPrefix.post('/netflow-ui/asn', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setAsn('');
        setCountryId('');
        setCountryName('');
        setOrganization('');
        setLoading(false);
        toast.success('Created Successfully.');
        getApi();
        setIsModalOpen(false);
      } else if (response.status === 409) {
        toast.error('AS Number already exists.');
      } else {
        setError('Failed to register, please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      setError('Failed to register, please try again.');
    }
  };

  const handleAsnChange = (event) => {
    const value = event.target.value;
    setAsn(value);
  };
  const handleCountryIdChange = (event) => {
    const value = event.target.value;
    setCountryId(value);
  };
  const handleCountryNameChange = (event) => {
    const value = event.target.value;
    setCountryName(value);
  };
  const handleOrganizationChange = (event) => {
    const value = event.target.value;
    setOrganization(value);
  };

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 50
    },
    { field: 'as_number', headerName: 'AS Number', flex: 0.8 },
    { field: 'name', headerName: 'Name', flex: 1.1 },
    { field: 'network', headerName: 'Network', flex: 1 },
    { field: 'region_name', headerName: 'Region Name', flex: 1 },
    { field: 'ip_ref', headerName: 'IP Reference', flex: 1 },
    { field: 'ip_ref_reverse', headerName: 'IP Reverse', flex: 1 }
  ];

  // API DELETE DATA SITE
  const deleteAccount = async (rowData) => {
    try {
      const res = await axiosPrefix.delete('/netflow-ui/asn', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          asn: `${rowData}`
        }
      });

      if (res.status === 200) {
        toast.success('Deleted Successfully.');
        setLoading(false);
        getApi();
      } else {
        toast.error('Failed to delete user, please try again.');
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  // API GET DATA SITE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');

        const response = await axiosPrefix.get('/netflow-ui/prefix', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });
        setLoading(false);
        setUsers(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="View" arrow>
                <div className="viewButtonOperator">
                  <PageviewOutlinedIcon className="viewIcon" onClick={() => viewSite(rowData.row.asn)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description={`Are you sure to delete AS Number: ${rowData.row.asn}?`}
                    onConfirm={() => deleteAccount(rowData.row.asn)}
                    icon={
                      <QuestionCircleOutlined
                        style={{
                          color: 'red'
                        }}
                      />
                    }
                  >
                    <div className="deleteButtonOperator">
                      <DeleteForeverOutlinedIcon />
                    </div>
                  </Popconfirm>
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

  // Layout Form Input

  const layout = {
    labelCol: {
      span: 5,
      style: {
        textAlign: 'left'
      }
    },
    wrapperCol: {
      span: 18
    }
  };

  return (
    <MainCard>
      <ToastContainer />
      <Modal
        centered
        onOk={handleOk}
        onCancel={handleCancel}
        open={isModalOpen}
        width={700}
        className="containerModal"
        style={{
          left: 150,
          top: 40
        }}
      >
        <h2>Input New Prefix</h2>
        <Form {...layout} name="nest-messages" ref={formRef}>
          <Form.Item
            label="AS Number"
            rules={[
              {
                required: true,
                message: 'Please input the AS Number!'
              }
            ]}
          >
            <div className="firstLine">
              <Input value={asn} onChange={handleAsnChange} />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleAutoFill}>
                Auto Fill
              </Button>
            </div>
          </Form.Item>
          <Form.Item
            label="Country ID"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input value={countryId} onChange={handleCountryIdChange} />
          </Form.Item>
          <Form.Item
            label="Country Name"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input value={countryName} onChange={handleCountryNameChange} />
          </Form.Item>
          <Form.Item
            label="Organization"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input value={organization} onChange={handleOrganizationChange} />
          </Form.Item>
        </Form>
      </Modal>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadAccount">
            <h2>Table Prefix List</h2>
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={showModal}>
              Add New
            </Button>
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
              rows={addIndex(users)}
              getRowId={(row) => row.id}
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

export default ListPrefix;
