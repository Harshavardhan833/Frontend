import React, { useState, useEffect } from 'react'; // Import hooks
import { useDispatch } from 'react-redux';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Card, CardContent, Link as MuiLink,
  Avatar, Drawer, List, ListItem, ListItemText, ListItemIcon, useTheme, useMediaQuery,
  Grid, CircularProgress // Added for loading indicator
} from '@mui/material';
import {
  NotificationsNone, SettingsOutlined, Menu as MenuIcon, Home, DirectionsCar, Assessment,
  BarChart, MonitorHeart, Map as MapIcon, People, Build, Logout, CloseFullscreen as CloseFullscreenIcon,
} from '@mui/icons-material';
import { logoutUser } from '../store/authSlice';
import api from '../api'; // Import the configured API client

// Import other page components
import VehicleAnalysisPage from './vehicleAnalysis';
import VehicleSelectionPage from './vehicleSelection';
import ReportsPage from './reports';
import TrailsPage from './trails';
import SettingsPage from './settings';
import SuperuserPage from './superuser';


const PlaceholderPage = ({ title }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>{title}</Typography>
    <Typography>This is a placeholder page for the {title} section.</Typography>
  </Box>
);

const HealthMonitoringPage = () => <PlaceholderPage title="Health Monitoring" />;
const MaintenancePage = () => <PlaceholderPage title="Maintenance" />;

// --- Reusable StatCard Component (No changes needed) ---
const StatCard = ({ title, value, active, special }) => (
  <Card
    sx={{
      backgroundColor: special ? 'primary.main' : 'background.paper',
      color: special ? 'common.white' : 'text.primary',
      height: '100%', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      p: 2, borderRadius: 2, boxShadow: '0 8px 24px rgba(14,28,48,0.06)',
    }}
  >
    {special && <Box sx={{ position: 'absolute', inset: 0, opacity: 0.06, bgcolor: 'black' }} />}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography variant="body2" sx={{ color: special ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
        {value}
      </Typography>
      {active !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
          <Typography variant="caption" sx={{ color: special ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
            {active} Active
          </Typography>
        </Box>
      )}
    </Box>
  </Card>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState('Home');
  const dispatch = useDispatch();
  
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [isMapView, setIsMapView] = useState(true);

  // --- NEW: State for holding dashboard data from the backend ---
  const [dashboardStats, setDashboardStats] = useState({ fleet: [], performance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: useEffect to fetch data when the component mounts ---
   useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true); // Set loading at the start
        const response = await api.get('/api/dashboard-stats/');
        
        // Process fleet stats (no change here)
        const formattedFleetStats = response.data.fleet_stats.map((stat, index) => ({
            title: stat.title,
            value: stat.value,
            active: stat.active,
            special: index === 0,
        }));

        // --- NEW: Dynamically create the performance stats array from the API response ---
        const backendPerformanceStats = response.data.performance_stats;
        
        // A helper function to format the titles nicely
        const formatTitle = (key) => {
          return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };
        
        const performanceData = Object.entries(backendPerformanceStats).map(([key, value]) => ({
            title: formatTitle(key),
            value: value,
        }));

        setDashboardStats({ fleet: formattedFleetStats, performance: performanceData });

      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavClick = (viewName) => {
    if (viewName === 'Logout') {
      dispatch(logoutUser());
      return;
    }
    setActiveView(viewName);
    if (!isDesktop) {
        setMobileOpen(false);
    }
  };

  const handleShowDetails = () => setIsMapView(false);
  const handleShowMap = () => setIsMapView(true);

  const navLinks = [
    { text: 'Home', icon: <Home /> },
    { text: 'Vehicle Selection', icon: <DirectionsCar /> },
    { text: 'Analysis', icon: <Assessment /> },
    { text: 'Reports', icon: <BarChart /> },
    { text: 'Health Monitoring', icon: <MonitorHeart /> },
    { text: 'Trails', icon: <MapIcon /> },
    { text: 'User Management', icon: <People /> },
    { text: 'Maintenance', icon: <Build /> },
  ];
  
  const drawerContent = (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>EKA Connect</Typography>
      <List>
        {[...navLinks, { text: 'Settings', icon: <SettingsOutlined />}, { text: 'Logout', icon: <Logout /> }].map((item) => (
          <ListItem button key={item.text} onClick={() => handleNavClick(item.text)} sx={{ borderRadius: 2, mb: 1, ...(activeView === item.text && { bgcolor: 'action.selected' }) }}>
            <ListItemIcon sx={{ color: activeView === item.text ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: activeView === item.text ? 'primary.main' : 'inherit', '& .MuiTypography-root': { fontWeight: activeView === item.text ? 'bold' : 'normal' } }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderHomePage = () => {
    const mapInteractionEnabled = isDesktop && isMapView;

    // --- NEW: Handle loading and error states for the home page content ---
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }

    if (error) {
      return <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
    }

    return (
      <>
        <Typography variant="h6" gutterBottom>Total Fleet Size</Typography>
        {/* Grid now uses data from the 'dashboardStats' state */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dashboardStats.fleet.map((stat) => (
            <Grid item xs={6} sm={4} md={2} key={stat.title}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%', flexGrow: 1, minHeight: 0 }}>
          <Box 
            sx={{
              position: 'relative', width: { xs: '100%', md: isMapView ? '100%' : `calc(100% - 324px)` },
              transition: 'width 0.5s ease-in-out', cursor: mapInteractionEnabled ? 'pointer' : 'default',
              height: { xs: 300, md: 'auto' }, flexShrink: { xs: 0, md: 1 },
            }} 
            onClick={mapInteractionEnabled ? handleShowDetails : undefined}
          >
            <Card sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
              {mapInteractionEnabled && (
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white', borderRadius: 2, zIndex: 1, textAlign: 'center' }}>
                  <Typography variant="h6">Click to View Stats</Typography>
                </Box>
              )}
              {isDesktop && !isMapView && (
                <IconButton onClick={handleShowMap} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, bgcolor: 'white', '&:hover': { bgcolor: 'grey.200' } }}>
                  <CloseFullscreenIcon />
                </IconButton>
              )}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.04363249043!2d73.79292682944648!3d18.52456485994404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1723378857448!5m2!1sen!2sin"
                style={{ width: '100%', height: '100%', border: 0, pointerEvents: mapInteractionEnabled ? 'none' : 'auto' }}
                allowFullScreen="" loading="lazy" title="Live Vehicle Map"
              />
            </Card>
          </Box>

          <Box 
            sx={{ 
              width: { xs: '100%', md: isMapView ? '0px' : '300px' },
              transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
              opacity: { xs: 1, md: isMapView ? 0 : 1 },
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            {/* Stats column now uses data from the 'dashboardStats' state */}
            <Grid container spacing={2}>
              {dashboardStats.performance.map((stat) => (
                <Grid item xs={12} key={stat.title}>
                  <Card sx={{ width: '100%', borderRadius: 2, flexShrink: 0 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>{stat.title}</Typography>
                      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Home': return renderHomePage();
      case 'Vehicle Selection': return <VehicleSelectionPage />;
      case 'Analysis': return <VehicleAnalysisPage />;
      case 'Reports': return <ReportsPage />;
      case 'Health Monitoring': return <HealthMonitoringPage />;
      case 'Trails': return <TrailsPage />;
      case 'User Management': return <SuperuserPage />;
      case 'Maintenance': return <MaintenancePage />;
      case 'Settings': return <SettingsPage />;
      default: return renderHomePage();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: '#f4f6f8' }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 } }}>
        {drawerContent}
      </Drawer>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 4, display: { xs: 'none', md: 'block' } }}>EKA Connect</Typography>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
                    {navLinks.map((item) => (
                    <MuiLink key={item.text} component="button" onClick={() => handleNavClick(item.text)} underline="none" sx={{ color: activeView === item.text ? 'primary.main' : 'text.secondary', fontWeight: activeView === item.text ? 'bold' : 500, fontSize: '0.9rem', position: 'relative', '&::after': { content: '""', position: 'absolute', width: '100%', transform: activeView === item.text ? 'scaleX(1)' : 'scaleX(0)', height: '2px', bottom: -4, left: 0, bgcolor: 'primary.main', transformOrigin: 'bottom left', transition: 'transform 0.25s ease-out' } }}>
                        {item.text}
                    </MuiLink>
                    ))}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              <IconButton color="inherit"><NotificationsNone /></IconButton>
              <IconButton color="inherit" onClick={() => handleNavClick('Settings')}><SettingsOutlined /></IconButton>
              <MuiLink component="button" onClick={() => handleNavClick('Logout')} underline="none" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.9rem', display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center', gap: 0.5, '&:hover': { color: 'primary.main' } }}>
                <Logout sx={{ fontSize: '1.25rem' }} />
                Logout
              </MuiLink>
              <IconButton><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>A</Avatar></IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', p: { xs: 2, md: 3 } }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;