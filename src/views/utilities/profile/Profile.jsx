import React, { useState, useContext, useEffect, useRef } from 'react';
import './profile.scss';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Checkbox, Form, Input, Spin, Space } from 'antd';
import UserContext from 'UserContext';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const Profile = () => {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const [passwordDisabled, setPasswordDisabled] = useState(false);
  const { user } = useContext(UserContext);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [active, setActive] = useState('');
  const [password, setPassword] = useState('');
  const userRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDisabled, setShowPasswordDisabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowPasswordDisabled(passwordDisabled);
  }, [passwordDisabled]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (user) {
      const accessToken = localStorage.getItem('access_token');
      const userId = user.id;
      const apiUrl = `/administrator/${userId}`;

      axiosPrivate
        .get(apiUrl, {
          headers: {
            Authorization: accessToken
          }
        })
        .then((response) => {
          userRef.current = response.data;
          console.log(response.data);
          setEmail(response.data.email);
          setFullname(response.data.fullname);
          setId(response.data.id);
          setActive(response.data.active);
          setLoading(false);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch((error) => {
          console.error('Failed to fetch user data:', error);
          setLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    // Ambil data user dari localStorage saat komponen di-mounting
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      userRef.current = storedUser;
      setEmail(storedUser.email);
      setFullname(storedUser.fullname);
      setId(storedUser.id);
      setActive(storedUser.active);
      setLoading(false);
    }
  }, []);

  // UPDATE DATA
  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    const updatedUserData = { id, fullname, email, password };
    axiosPrivate
      .put(`/administrator`, updatedUserData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success('Updated Successfully.');
          userRef.current = updatedUserData;
          setEmail(updatedUserData.email);
          setFullname(updatedUserData.fullname);
          setId(updatedUserData.id);
          setActive(updatedUserData.active);
          localStorage.setItem('user', JSON.stringify(response.data));
          setLoading(false);
        } else {
          toast.error('Failed to update, please try again.');
          setLoading(false);
        }
      })
      .catch((err) => {
        toast.error('Failed to update, please try again.');
        console.log(err);
        setLoading(false);
      });
  };

  const handleNameChangeEdit = (event) => {
    setFullname(event.target.value);
  };

  const handleEmailChangeEdit = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChangeEdit = (event) => {
    setPassword(event.target.value);
  };

  const toHome = () => {
    navigate('/home');
  };

  return (
    <MainCard>
      <ToastContainer />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHeadProfile">
            <h2>Setting Profile</h2>
          </div>
        </Grid>
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
          <Grid item xs={12} className="containerBottomProfile">
            <div className="profileLeft">
              <div className="imgContainer"></div>
              <p>{fullname}</p>
              <p>{id}</p>
            </div>
            <div className="profileRight">
              <div className="rightTop">
                <h3>
                  <button onClick={toHome}>
                    <KeyboardBackspaceIcon />
                    <span>Back to Home</span>
                  </button>
                </h3>
                <h3>
                  <Checkbox checked={componentDisabled} onChange={(e) => setComponentDisabled(e.target.checked)}>
                    Edit Profile
                  </Checkbox>
                </h3>
              </div>
              <div className="rightMiddle">
                <Form disabled={!componentDisabled}>
                  <div className="input">
                    <label htmlFor="id">ID :</label>
                    <Input id="id" value={id} disabled />
                  </div>
                  <div className="input">
                    <label htmlFor="fullname">Full Name :</label>
                    <Input id="fullname" value={fullname} onChange={handleNameChangeEdit} />
                  </div>
                  <div className="input">
                    <label htmlFor="email">Email :</label>
                    <Input id="email" value={email} onChange={handleEmailChangeEdit} />
                  </div>
                  <div className="input">
                    <label htmlFor="status">Status :</label>
                    <Input id="status" value={active ? 'Active' : 'Disable'} disabled />
                  </div>
                  <div className="input">
                    <Checkbox checked={passwordDisabled} onChange={(e) => setPasswordDisabled(e.target.checked)}>
                      Edit Password :
                    </Checkbox>
                    <Input.Password
                      id="password"
                      value={password}
                      onChange={handlePasswordChangeEdit}
                      disabled={!showPasswordDisabled}
                      iconRender={(visible) =>
                        visible ? (
                          <EyeOutlined onClick={togglePasswordVisibility} />
                        ) : (
                          <EyeInvisibleOutlined onClick={togglePasswordVisibility} />
                        )
                      }
                    />
                  </div>
                  <div className="submitBtn">
                    <Button onClick={handleSubmit}>Save Profile</Button>
                  </div>
                </Form>
              </div>
              <div className="rightBottom"></div>
            </div>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
};

export default Profile;
