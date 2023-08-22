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
const UtilsAllUsage = Loadable(lazy(() => import('views/utilities/allusages/AllUsage')));
const UtilsSites = Loadable(lazy(() => import('views/utilities/sites/Site')));
const TotalChart = Loadable(lazy(() => import('views/utilities/totalchart/TotalChart')));
const UtilsAdministrator = Loadable(lazy(() => import('views/utilities/account/Account')));
const UtilsViewSite = Loadable(lazy(() => import('views/utilities/viewsites/ViewSite')));
const UtilsViewAsn = Loadable(lazy(() => import('views/utilities/viewasn/ViewAsn')));
const UtilsViewPrefix = Loadable(lazy(() => import('views/utilities/viewprefix/ViewPrefix')));
const Analytics = Loadable(lazy(() => import('views/utilities/analytics/Analytics')));
const Prefix = Loadable(lazy(() => import('views/utilities/prefix/Prefix')));
const ListPrefix = Loadable(lazy(() => import('views/utilities/listprefix/ListPrefix')));
const Asnumber = Loadable(lazy(() => import('views/utilities/asnumber/Asnumber')));
const EditProfile = Loadable(lazy(() => import('views/utilities/editprofile/EditProfile')));
const EditPrefix = Loadable(lazy(() => import('views/utilities/editprefix/EditPrefix')));
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
                  element: <UtilsAllUsage />
                },
                {
                  path: 'sites',
                  element: <UtilsSites />
                },
                {
                  path: 'totalchart',
                  element: <TotalChart />
                },
                {
                  path: 'analytics',
                  element: <Analytics />
                },
                {
                  path: 'analytics/viewsite/:id',
                  element: <UtilsViewSite />
                }
              ]
            },
            {
              path: 'custom-prefix',
              children: [
                {
                  path: 'asnumber',
                  element: <Asnumber />
                },
                {
                  path: 'list-prefix',
                  element: <ListPrefix />
                },
                {
                  path: 'group-prefix',
                  element: <Prefix />
                },
                {
                  path: 'asnumber/viewasnumber/:asn',
                  element: <UtilsViewAsn />
                },
                {
                  path: 'asnumber/editprefix/:id',
                  element: <EditPrefix />
                },
                {
                  path: 'group-prefix/viewprefix/:id',
                  element: <UtilsViewPrefix />
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
