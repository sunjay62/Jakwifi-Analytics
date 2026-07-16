import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useMonthlyReport } from './MonthlyReportProvider';
// material-ui
// import { useTheme } from '@mui/material/styles';
import { Button, CardActions, CardContent, Divider, Grid, Typography } from '@mui/material';

// project imports
// import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
// import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
// import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
// import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

const PopularCard = ({ isLoading }) => {
  // const theme = useTheme();

  // const [anchorEl, setAnchorEl] = useState(null);

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const { loading, topSites } = useMonthlyReport();

  return (
    <>
      {isLoading || loading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12}>
                <Grid container alignContent="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4">Most BW Usage</Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item xs={12} sx={{ pt: '16px !important' }}>
                <BajajAreaChartCard />
              </Grid> */}
              <Grid item xs={12}>
                <Grid container direction="column">
                  {topSites.map((result, index) => (
                    <Grid item key={index}>
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            Site : {result.site}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                              <Typography variant="subtitle1" color="inherit">
                                Bandwidth : {result.bandwidth}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
                          {result.device} Device
                        </Typography>
                      </Grid>
                      <Divider sx={{ my: 1.5 }} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Link to="/jakwifi/allusage/darat" style={{ textDecoration: 'none' }}>
              <Button size="small" disableElevation>
                View All
                <ChevronRightOutlinedIcon />
              </Button>
            </Link>
          </CardActions>
        </MainCard>
      )}
    </>
  );
};

PopularCard.propTypes = {
  isLoading: PropTypes.bool
};

export default PopularCard;
