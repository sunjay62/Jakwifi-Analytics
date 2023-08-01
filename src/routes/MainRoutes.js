import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import PrivateRoutes from './Privateroutes';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Profile from 'views/utilities/profile/Profile';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
// const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));
const UtilsUsage = Loadable(lazy(() => import('views/utilities/usages/Usage')));
const UtilsAllSites = Loadable(lazy(() => import('views/utilities/allsites/AllSites')));
const UtilsNewSites = Loadable(lazy(() => import('views/utilities/newsites/NewSites')));
const UtilsAdministrator = Loadable(lazy(() => import('views/utilities/account/Account')));
const TotalChart = Loadable(lazy(() => import('views/utilities/totalchart/TotalChart')));
const Analytics = Loadable(lazy(() => import('views/utilities/analytics/Analytics')));
const EditProfile = Loadable(lazy(() => import('views/utilities/editprofile/EditProfile')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const Login = Loadable(lazy(() => import('views/pages/login/Login')));
const NotFound = Loadable(lazy(() => import('views/pages/notfound/Notfound')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Outlet />, // Use Outlet as the root element
  children: [
    {
      path: '',
      element: <Login />
    },
    {
      path: '',
      element: <PrivateRoutes />, // Use PrivateRoutes component here
      children: [
        {
          path: '',
          element: <MainLayout />,
          children: [
            {
              path: 'home',
              element: <DashboardDefault />
            },
            {
              path: 'jakwifi',
              children: [
                {
                  path: 'usage',
                  element: <UtilsUsage />
                },
                {
                  path: 'allusage',
                  element: <UtilsAllSites />
                },
                {
                  path: 'sites',
                  element: <UtilsNewSites />
                },
                {
                  path: 'totalchart',
                  element: <TotalChart />
                },
                {
                  path: 'analytics',
                  element: <Analytics />
                }
              ]
            },
            {
              path: 'account',
              children: [
                {
                  path: 'administrator',
                  element: <UtilsAdministrator />
                }
              ]
            },
            {
              path: 'setting',
              children: [
                {
                  path: 'profile',
                  element: <Profile />
                }
              ]
            },
            {
              path: 'edit/profile',
              children: [
                {
                  path: ':id',
                  element: <EditProfile />
                }
              ]
            },
            {
              path: 'utils',
              children: [
                {
                  path: 'util-color',
                  element: <UtilsColor />
                },
                {
                  path: 'util-shadow',
                  element: <UtilsShadow />
                }
              ]
            },
            {
              path: 'icons',
              children: [
                {
                  path: 'tabler-icons',
                  element: <UtilsTablerIcons />
                },
                {
                  path: 'material-icons',
                  element: <UtilsMaterialIcons />
                }
              ]
            },
            {
              path: 'sample-page',
              element: <SamplePage />
            }
          ]
        }
      ]
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]
};

export default MainRoutes;
