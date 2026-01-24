'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

// MUI Imports
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  Divider,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [statsData, setStatsData] = useState(null);
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchData = async (startDate, endDate) => {
    try {
      const date1 = startDate.toISOString().split('T')[0];
      const date2 = endDate.toISOString().split('T')[0];

      const response = await fetch('/api/dashboard/allorders', {
        method: 'POST',
        body: JSON.stringify({ date1, date2 }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatsData(result.data);

        const salesLabels = [];
        const pendingAmounts = [];
        const paidAmounts = [];
        const shippedAmounts = [];
        const completedAmounts = [];
        const cancelledAmounts = [];

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          salesLabels.push(
            currentDate.toLocaleDateString('default', {
              month: 'short',
              day: 'numeric',
            })
          );

          const totalPending = result.data.pending?.amount || 0;
          const totalPaid = result.data.paid?.amount || 0;
          const totalShipped = result.data.shipped?.amount || 0;
          const totalCompleted = result.data.completed?.amount || 0;
          const totalCancelled = result.data.cancelled?.amount || 0;

          pendingAmounts.push(totalPending);
          paidAmounts.push(totalPaid);
          shippedAmounts.push(totalShipped);
          completedAmounts.push(totalCompleted);
          cancelledAmounts.push(totalCancelled);

          currentDate.setDate(currentDate.getDate() + 1);
        }

        setSalesData({
          labels: salesLabels,
          datasets: [
            {
              label: 'Pending',
              data: pendingAmounts,
              borderColor: '#FBBF24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              tension: 0.4, // Smooth lines
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Paid',
              data: paidAmounts,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Shipped',
              data: shippedAmounts,
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Completed',
              data: completedAmounts,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Cancelled',
              data: cancelledAmounts,
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]); // Added dependency array to refetch on date change

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  };

  const { stats, totalAmount } = useMemo(() => {
    if (!statsData) return { stats: [], totalAmount: 0 };

    const items = [
      {
        label: 'Pending Orders',
        value: statsData.pending?.count || 0, // Safe access
        amount: statsData.pending?.amount || 0,
        icon: <InventoryIcon sx={{ fontSize: 20 }} />,
        color: '#FBBF24',
      },
      {
        label: 'Paid Orders',
        value: statsData.paid?.count || 0,
        amount: statsData.paid?.amount || 0,
        icon: <PaymentIcon sx={{ fontSize: 20 }} />,
        color: '#3B82F6',
      },
      {
        label: 'Shipped Orders',
        value: statsData.shipped?.count || 0,
        amount: statsData.shipped?.amount || 0,
        icon: <LocalShippingIcon sx={{ fontSize: 20 }} />,
        color: '#6366F1',
      },
      {
        label: 'Completed Orders',
        value: statsData.completed?.count || 0,
        amount: statsData.completed?.amount || 0,
        icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
        color: '#10B981',
      },
      {
        label: 'Cancelled Orders',
        value: statsData.cancelled?.count || 0,
        amount: statsData.cancelled?.amount || 0,
        icon: <CancelIcon sx={{ fontSize: 20 }} />,
        color: '#EF4444',
      },
    ];
    const total = items.reduce((acc, item) => acc + (item.amount || 0), 0);
    return { stats: items, totalAmount: total };
  }, [statsData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          },
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 12 },
          color: '#9CA3AF',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 12 },
          color: '#9CA3AF',
          padding: 10,
        },
      },
    },
  };

  return (
    <Box sx={{ pt: 3, minHeight: '100vh', bgcolor: '#F0F2F5' }}> {/* More professional off-white */}
      <Container maxWidth="lg" sx={{ px: 3 }}>
        {/* Date Filter Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            mb: 6,
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '10px 24px',
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start date"
                customInput={
                  <TextField
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    placeholder="Start date"
                    sx={{
                      width: 100,
                      '& input': {
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#374151'
                      }
                    }}
                  />
                }
              />
              <Typography sx={{ color: '#9CA3AF', fontWeight: 'bold' }}>—</Typography>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End date"
                customInput={
                  <TextField
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    placeholder="End date"
                    sx={{
                      width: 100,
                      '& input': {
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#374151'
                      }
                    }}
                  />
                }
              />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Button
              variant="contained"
              onClick={handleFilter}
              sx={{
                px: 3,
                py: 0.75,
                borderRadius: '50px',
                textTransform: 'none',
                backgroundColor: '#3B82F6',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                fontSize: '0.875rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#2563EB',
                  boxShadow: '0 6px 15px rgba(59, 130, 246, 0.4)',
                }
              }}
            >
              Filter
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 4 }} columns={10}> {/* Use 10 columns for 5 items (2 cols each) */}
            {stats.map((stat, index) => (
              <Grid item xs={10} sm={5} md={2} key={index} sx={{ display: 'flex' }}> {/* Added display: flex to Grid item */}
                <Card
                  sx={{
                    p: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(26, 32, 44, 0.08)', // Use a hint of sidebar color for borders
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    background: `linear-gradient(135deg, #fff 60%, ${stat.color}15 100%)`, // Subtle thematic gradient
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                      transform: 'translateY(-2px)',
                      '& .stat-icon-bg': {
                        transform: 'scale(1.1) rotate(5deg)',
                      }
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                    <IconButton
                      className="stat-icon-bg"
                      sx={{
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        mr: 2,
                        p: 1.5,
                        borderRadius: '16px',
                        cursor: 'default',
                        transition: 'transform 0.3s ease',
                      }}
                      disableRipple
                    >
                      {stat.icon}
                    </IconButton>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.2, fontSize: '1.1rem' }}>
                        {stat.value} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#6B7280' }}>Orders</span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.8rem', mt: 0.5, display: 'block' }}>
                        {(stat.amount || 0).toLocaleString()} Rs.
                      </Typography>
                    </Box>
                  </CardContent>
                  {/* Subtle accent bar aligned to the bottom for uniformity */}
                  <Box sx={{ height: '4px', bgcolor: stat.color, width: '50%', borderRadius: '2px', mt: 'auto', mb: 1.5, ml: 3, opacity: 0.6 }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>Loading stats...</Typography>
        )}

        {/* Analytics Section: Sales Distribution & Chart */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Sales Distribution (Percentages) */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                borderRadius: '24px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
                Sales Distribution
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
                Revenue breakdown by order status
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {stats.map((stat, index) => {
                  const percentage = totalAmount > 0 ? ((stat.amount / totalAmount) * 100).toFixed(1) : 0;
                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stat.color }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            {stat.label.split(' ')[0]}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {percentage}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 8, bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${percentage}%`,
                            height: '100%',
                            bgcolor: stat.color,
                            borderRadius: 4,
                            transition: 'width 1s ease-in-out'
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ mt: 'auto', pt: 4 }}>
                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#3B82F6' }}>
                    {totalAmount.toLocaleString()} Rs.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Sales Chart */}
          <Grid item xs={12} lg={8}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                borderRadius: '24px',
                border: '1px solid #E5E7EB',
                background: '#fff',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '1.25rem' }}>
                    Sales Overview
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                    Order performance trends
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 400 }}>
                <Line data={salesData} options={options} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}