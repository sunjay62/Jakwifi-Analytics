import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import axiosNgasal from 'api/axiosNgasal';

const MonthlyReportContext = createContext(null);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const convertBandwidthToNumber = (bandwidth) => {
  if (typeof bandwidth !== 'string') {
    return 0;
  }
  const [value, unit] = bandwidth.split(' ');
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return 0;
  }
  // Nilai selalu dikembalikan dalam satuan Gigabyte
  switch (unit) {
    case 'TB':
      return numValue * 1024;
    case 'GB':
      return numValue;
    case 'MB':
      return numValue / 1024;
    case 'KB':
      return numValue / 1024 / 1024;
    case 'B':
      return numValue / 1024 / 1024 / 1024;
    default:
      return 0;
  }
};

const formatBandwidth = (value, decimals = 0) => {
  const units = ['T', 'P', 'E'];
  let formattedValue = value;
  let unitIndex = 0;

  while (formattedValue >= 1024 && unitIndex < units.length) {
    formattedValue /= 1024;
    unitIndex++;
  }

  return (decimals ? formattedValue.toFixed(decimals) : Math.floor(formattedValue)) + ' ' + units[unitIndex];
};

const buildTopSites = (rawData) =>
  rawData
    .map((item) => ({
      ...item,
      bandwidthValue: typeof item.bandwidth === 'string' ? parseFloat(item.bandwidth.replace(/[^\d.]/g, '')) : 0
    }))
    .filter((item) => item.bandwidthValue > 1 && item.bandwidthValue > 0.01)
    .sort((a, b) => {
      const bandwidthA = a.bandwidth;
      const bandwidthB = b.bandwidth;

      if (bandwidthA.includes('T') && !bandwidthB.includes('T')) return -1;
      if (!bandwidthA.includes('T') && bandwidthB.includes('T')) return 1;
      if (bandwidthA.includes('G') && !bandwidthB.includes('G')) return -1;
      if (!bandwidthA.includes('G') && bandwidthB.includes('G')) return 1;
      if (bandwidthA.includes('M') && !bandwidthB.includes('M')) return -1;
      if (!bandwidthA.includes('M') && bandwidthB.includes('M')) return 1;
      return b.bandwidthValue - a.bandwidthValue;
    })
    .map((item) => {
      const matchResult = typeof item.site === 'string' ? item.site.match(/TCF-\d{5}/) : null;
      return { ...item, site: matchResult ? matchResult[0] : item.site };
    })
    .slice(0, 7);

// ==============================|| DASHBOARD - MONTHLY REPORT PROVIDER ||============================== //
// Satu sumber hit ke /ngasal/report/monthly/{month}/{year}/darat/raw/, dipakai bersama oleh
// EarningCard, TotalOrderLineChartCard, TotalIncomeDarkCard, TotalGrowthBarChart, dan PopularCard
// supaya endpoint yang sama tidak dipanggil berulang kali saat dashboard dibuka.

export const MonthlyReportProvider = ({ children }) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    totalSites: null,
    totalBandwidthFormatted: null,
    totalDevices: null,
    topSites: [],
    growthChart: { bwUsageData: [], dataDevice: [], monthYearData: [] }
  });

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
        const rawData = response.data;
        console.log(`[MonthlyReportProvider ${currentYear}-${currentMonth}] data didapat:`, rawData);

        const totalBandwidth = rawData.reduce((total, item) => total + convertBandwidthToNumber(item.bandwidth), 0);
        const totalDevices = rawData.reduce((total, item) => total + item.device, 0);

        setState({
          loading: false,
          error: null,
          totalSites: rawData.length,
          totalBandwidthFormatted: formatBandwidth(totalBandwidth),
          totalDevices,
          topSites: buildTopSites(rawData),
          growthChart: {
            bwUsageData: [formatBandwidth(totalBandwidth, 1)],
            dataDevice: [totalDevices],
            monthYearData: [`${MONTH_NAMES[currentMonth - 1]} ${currentYear}`]
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setState((prev) => ({ ...prev, loading: false, error }));
      }
    };

    fetchData();
  }, []);

  return <MonthlyReportContext.Provider value={state}>{children}</MonthlyReportContext.Provider>;
};

MonthlyReportProvider.propTypes = {
  children: PropTypes.node
};

export const useMonthlyReport = () => {
  const context = useContext(MonthlyReportContext);
  if (!context) {
    throw new Error('useMonthlyReport must be used within a MonthlyReportProvider');
  }
  return context;
};
