import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';
import axiosNgasal from 'api/axiosNgasal';
// assets
import DevicesTwoToneIcon from '@mui/icons-material/DevicesTwoTone';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.light,
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.primary[200]} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.primary[200]} -14.02%, rgba(144, 202, 249, 0) 77.58%)`,
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

// ==============================|| DASHBOARD - TOTAL INCOME DARK CARD ||============================== //

const TotalIncomeDarkCard = ({ isLoading }) => {
  const theme = useTheme();
  const [data, setData] = useState(null);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const endpoint = `/ngasal/report/monthly/${currentMonth}/${currentYear}/darat/raw/`;

    const fetchData = async () => {
      try {
        const response = await axiosNgasal.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Menghitung total data device dengan menjumlahkan semua devicenya
        const totalDataDevice = response.data.reduce((total, item) => total + item.device, 0);
        // console.log('Total Data Device:', totalDataDevice);
        setData(totalDataDevice);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2 }}>
            <List sx={{ py: 0 }}>
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemAvatar>
                  <Link to="/jakwifi/allusage/darat" style={{ textDecoration: 'none' }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        backgroundColor: theme.palette.primary[800],
                        color: '#fff'
                      }}
                    >
                      <DevicesTwoToneIcon fontSize="inherit" />
                    </Avatar>
                  </Link>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    py: 0,
                    mt: 0.45,
                    mb: 0.45
                  }}
                  primary={
                    <Typography variant="h4" sx={{ color: '#fff' }}>
                      {data}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="subtitle2" sx={{ color: 'primary.light', mt: 0.25 }}>
                      Total Devices Connected
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

TotalIncomeDarkCard.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalIncomeDarkCard;
