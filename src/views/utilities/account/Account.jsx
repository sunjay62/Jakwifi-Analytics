import React, { useState, useEffect, useRef } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Spin, Space } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import './account.scss';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const axiosPrivate = useAxiosPrivate(); // const refresh = useRefreshToken();
  const formRef = useRef(null); // Buat referensi untuk form instance
  const [fullnameValid, setFullnameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleShowEdit = (id) => {
    navigate(`/edit/profile/${id}`);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (!fullname || !email || !password || !fullnameValid || !emailValid || !passwordValid) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (formRef.current) {
      formRef.current.submit();
    }

    handleSubmit();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setName('');
    setIdData('');
  };

  const handleFullnameChange = (event) => {
    const value = event.target.value;
    setFullname(value);
    setFullnameValid(!!value); // Set status validasi menjadi true jika value tidak kosong
  };

  const isEmailValid = (value) => {
    // Regex untuk memeriksa email yang valid
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailPattern.test(value);
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setEmailValid(isEmailValid(value));
  };

  // Fungsi untuk memeriksa apakah password sudah terdiri dari huruf kapital dan angka atau belum
  const isPasswordValid = (value) => {
    // Regex untuk memeriksa minimal 1 huruf kapital dan 1 angka
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(value);
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    setPasswordValid(isPasswordValid(value));
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
        // console.log(token);

        const res = await axiosPrivate.get('/administrator', {
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

  // INI API UNTUK CREATE NEW SITE

  const handleSubmit = async () => {
    const postData = { email, fullname, password };
    try {
      const accessToken = localStorage.getItem('access_token');

      const response = await axiosPrivate.post('/administrator', postData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      });

      // console.log(response.status);

      if (response.status === 200) {
        setFullname('');
        setEmail('');
        setPassword('');
        toast.success('Registered Successfully.');
        setLoading(false);
        getApi();
      } else if (response.status === 409) {
        toast.error('User already exists.');
        setLoading(false);
      } else {
        setError('Failed to register, please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError('Failed to register, please try again.');
    }
  };

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'fullname', headerName: 'Full Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'active',
      headerName: 'Status',
      flex: 1,
      valueGetter: (params) => (params.value ? 'Active' : 'Disable')
    }

    // ini contoh kalo pengen dapetin value dari 2 row di jadikan satu
    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    //   valueGetter: (params) => `${params.row.name || ''} ${params.row.lastName || ''}`
    // }
  ];

  // API DELETE DATA SITE

  const deleteAccount = async (id) => {
    try {
      const accessToken = localStorage.getItem('access_token');

      const res = await axiosPrivate.delete('/administrator', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        },
        data: {
          id: `${id}`
        }
      });

      // console.log('deleted clicked');
      if (res.status === 200) {
        toast.success('Deleted Successfuly.');
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

        const response = await axiosPrivate.get('/administrator', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        // console.log(response.data);
        setLoading(false);
        setUsers(response.data.data);
        // isMounted && setUsers(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // dummy data site
  //   const users = [
  //     { id: 'TCF-10001', public_ip: '101.255.255.255', name: 'TCR-10369 Jakwifi Site Kec Kepulauan Seribu Utara RW 005' },
  //     { id: 'TCF-10002', public_ip: '101.255.255.244', name: 'TCR-10370 Jakwifi Site Kec Kepulauan Seribu Utara RW 006' },
  //     { id: 'TCF-10003', public_ip: '101.255.255.233', name: 'TCR-1037 Jakwifi Site Kec Kepulauan Seribu Utara RW 007' }
  //   ];

  // INI UNTUK UPDATE DATA

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="viewButtonOperator">
                  <DriveFileRenameOutlineIcon className="viewIcon" onClick={() => handleShowEdit(rowData.id)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description="Are you sure to delete this Account?"
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
      <Modal title="Input New Account" centered onOk={handleOk} onCancel={handleCancel} open={isModalOpen}>
        <Form
          {...layout}
          name="nest-messages"
          ref={formRef} // Menghubungkan formRef dengan Form instance
          style={{
            maxWidth: 600,
            marginTop: 25
          }}
        >
          <Form.Item
            label="Full Name"
            rules={[
              {
                required: true,
                message: 'Please input the Fullname!'
              }
            ]}
            validateStatus={!fullnameValid ? 'error' : ''}
            help={!fullnameValid ? 'Fullname is required!' : ''}
          >
            <Input value={fullname} onChange={handleFullnameChange} />
          </Form.Item>
          <Form.Item
            label="Email Address"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (isEmailValid(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Please input a valid Email address!'));
                }
              }
            ]}
            validateStatus={!emailValid ? 'error' : ''}
            help={!emailValid ? 'Email is required' : ''}
          >
            <Input value={email} onChange={handleEmailChange} />
          </Form.Item>
          <Form.Item
            label="Password"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (isPasswordValid(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Password must consist of uppercase letters and numbers!'));
                }
              }
            ]}
            validateStatus={!passwordValid ? 'error' : ''}
            help={!passwordValid ? 'Password is required' : ''}
          >
            <Input.Password value={password} onChange={handlePasswordChange} />
          </Form.Item>
        </Form>
      </Modal>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadAccount">
            <h2>List Account</h2>
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

export default Account;
