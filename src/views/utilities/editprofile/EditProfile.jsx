import React, { useState, useEffect } from 'react';
import './editprofile.scss';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const EditProfile = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(false);
  const { id } = useParams();
  const [componentDisabled, setComponentDisabled] = useState(false);
  const [passwordDisabled, setPasswordDisabled] = useState(false);
  const axiosPrivate = useAxiosPrivate(); // const refresh = useRefreshToken();
  const navigate = useNavigate();
  const [statusValue, setStatusValue] = useState(active ? 'Active' : 'Disable');
  const { Option } = Select;
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDisabled, setShowPasswordDisabled] = useState(true);

  useEffect(() => {
    setShowPasswordDisabled(passwordDisabled);
  }, [passwordDisabled]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // GET DATA
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    axiosPrivate
      .get(`/administrator/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((res) => {
        setFullname(res.data.fullname);
        setEmail(res.data.email);
        setPassword(res.data.password);
        setActive(res.data.active);
        setStatusValue(res.data.active ? 'Active' : 'Disable'); // Update statusValue based on the 'active' value from response
      })
      .catch((err) => console.log(err));
  }, [id]);

  // UPDATE DATA
  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    const updatedUserData = { id, fullname, email, password, active };
    console.log('Data being sent:', updatedUserData);
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
          setTimeout(() => {
            navigate(`/account/administrator`);
          }, 1000);
        } else {
          setError('Failed to update, please try again.');
        }
      })
      .catch((err) => console.log(err));
  };

  const handleNameChange = (event) => {
    setFullname(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleStatusChange = (value) => {
    setStatusValue(value);
    setActive(value === true);
  };

  const toHome = () => {
    navigate('/account/administrator');
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHeadEditProfile">
            <h2>Setting Profile</h2>
          </div>
        </Grid>
        <Grid item xs={12} className="containerBottomEditProfile">
          <div className="EditProfileLeft">
            <div className="imgContainer"></div>
            <p>{fullname}</p>
            <p>{id}</p>
          </div>
          <div className="EditProfileRight">
            <div className="rightTop">
              <h3>
                <button onClick={toHome}>
                  <KeyboardBackspaceIcon />
                  <span>Back to List</span>
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
                  <Input id="fullname" value={fullname} onChange={handleNameChange} />
                </div>
                <div className="input">
                  <label htmlFor="email">Email :</label>
                  <Input id="email" value={email} onChange={handleEmailChange} />
                </div>
                <div className="input">
                  <label htmlFor="status">Status :</label>
                  <Select id="status" value={statusValue} onChange={handleStatusChange}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="input">
                  <Checkbox checked={passwordDisabled} onChange={(e) => setPasswordDisabled(e.target.checked)}>
                    Edit Password :
                  </Checkbox>
                  <Input.Password
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
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
      </Grid>
    </MainCard>
  );
};

export default EditProfile;
