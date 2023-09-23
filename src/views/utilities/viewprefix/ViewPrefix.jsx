import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { gridSpacing } from 'store/constant';
import './viewprefix.scss';
import { Dropdown, Button, Spin, Space } from 'antd';
import { BackwardOutlined } from '@ant-design/icons';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { Tooltip } from '@material-ui/core';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

const ViewPrefix = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [data, setData] = useState('');
  const axiosPrivate = useAxiosPrivate();

  //   const viewPrefix = (id) => {
  //     navigate(`/custom-prefix/group-prefix/viewprefix/${id}`);
  //   };

  const columns = [
    {
      field: 'no',
      headerName: 'No',
      width: 40
    },
    {
      headerName: 'AS Number',
      field: 'as_number',
      flex: 1
    },
    {
      headerName: 'Network',
      field: 'network',
      flex: 1.3
    },
    {
      headerName: 'Region Name',
      field: 'region_name',
      flex: 1.2
    },
    {
      headerName: 'Region Code',
      field: 'region_code',
      flex: 1.2
    },
    {
      headerName: 'IP Reverse',
      field: 'ip_ref_reverse',
      flex: 1.2
    },
    {
      headerName: 'IP Reference',
      field: 'ip_ref',
      flex: 1.2
    }
    // {
    //   headerName: 'Latitude',
    //   field: 'latitude',
    //   flex: 1
    // },
    // {
    //   headerName: 'Longitude',
    //   field: 'longitude',
    //   flex: 1
    // }
  ];

  const handleBack = () => {
    navigate(`/custom-prefix/group-prefix`);
  };

  // API GET DATA SITE
  useEffect(() => {
    const fetchData = async () => {
      const postData = { id: id };
      const accessToken = localStorage.getItem('access_token');
      try {
        const response = await axiosPrivate.post('/netflow-ui/prefix/groupname/info', postData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        setLoading(false);
        console.log(response);
        setName(response.data.groupname_info.name);
        setData(response.data.prefix_list);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // API DELETE PREFIX
  //   const deletePrefix = async (id) => {
  //     try {
  //       const accessToken = localStorage.getItem('access_token');

  //       const res = await axiosPrivate.delete('/netflow-ui/prefix', {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: accessToken
  //         },
  //         data: {
  //           id: `${id}`
  //         }
  //       });

  //       // console.log('deleted clicked');
  //       if (res.status === 200) {
  //         toast.success('Deleted Successfuly.');
  //         setLoading(false);
  //         fetchData();
  //       } else {
  //         toast.error('Failed to delete user, please try again.');
  //         setLoading(false);
  //       }
  //     } catch (err) {
  //       setLoading(false);
  //       console.log(err);
  //     }
  //   };

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
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

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      renderCell: () => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="viewButtonOperator">
                  <DriveFileRenameOutlineIcon className="viewIcon" />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description="Are you sure to delete this Prefix?"
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

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>Prefix Info</h2>
            <Button type="primary" onClick={handleBack}>
              <BackwardOutlined />
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12} className="containerData">
          <table className="dataAsnumber">
            <tbody>
              <tr>
                <th>Prefix Name</th>
                <td>{name}</td>
              </tr>
            </tbody>
          </table>
        </Grid>
        <Grid item xs={12}>
          <div className="containerTable">
            <h3>Table Prefix List</h3>
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
                columns={columns.concat(actionColumn)}
                rows={addIndex(data)}
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
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewPrefix;
