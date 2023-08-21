import React, { useState, useEffect, useRef } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
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
import './prefix.scss';
import { useNavigate } from 'react-router-dom';
import axiosPrefix from '../../../api/axiosPrefix';

const Prefix = () => {
  const [name, setName] = useState('');
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

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
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
        const res = await axiosPrefix.get('/netflow-ui/prefix/groupname', {
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
  const handleSubmit = async () => {
    const postData = { name: name };
    try {
      const response = await axiosPrefix.post('/netflow-ui/prefix/groupname', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setName('');
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

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'prefix_registerd', headerName: 'Prefix Registered', flex: 1 }
  ];

  // API DELETE DATA SITE
  const deleteAccount = async (rowData) => {
    try {
      const res = await axiosPrefix.delete('/netflow-ui/prefix/groupname', {
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

        const response = await axiosPrefix.get('/netflow-ui/prefix/groupname', {
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
      width: 150,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="View" arrow>
                <div className="viewButtonOperator">
                  <PageviewOutlinedIcon className="viewIcon" onClick={() => viewSite(rowData.id)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description={`Are you sure to delete AS Number: ${rowData.id}?`}
                    onConfirm={() => deleteAccount(rowData.id)}
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

  const addIdToRows = (array) => {
    return array.map((item, index) => {
      item.id = index + 1;
      return item;
    });
  };

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.id = index + 1; // Assign a unique id to each row
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
          left: 120,
          top: 40
        }}
      >
        <h2>Input New Group Name</h2>
        <Form {...layout} name="nest-messages" ref={formRef}>
          <Form.Item
            label="Prefix Name"
            rules={[
              {
                required: true,
                message: 'Please input the AS Number!'
              }
            ]}
          >
            <Input value={name} onChange={handleNameChange} />
          </Form.Item>
        </Form>
      </Modal>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadAccount">
            <h2>Group Name List</h2>
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
              rows={addIdToRows(addIndex(users))}
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

export default Prefix;
