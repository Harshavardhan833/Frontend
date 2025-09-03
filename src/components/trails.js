import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Menu,
  MenuItem,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  CloseFullscreen as CloseFullscreenIcon
} from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';


// DropdownButton Component (No changes)
const DropdownButton = ({ label, value, onChange, options }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (option) => {
    onChange(option);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          textTransform: 'none',
          minWidth: 180,
          justifyContent: 'space-between',
          borderRadius: 2,
          px: 2,
          borderColor: 'grey.300',
          color: 'text.primary',
        }}
      >
        {label}: {value}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'dropdown-button' }}
        PaperProps={{
          style: {
            maxHeight: 200,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            selected={option === value}
            onClick={() => handleSelect(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// VehicleDetailsCard Component (No changes)
const VehicleDetailsCard = ({ metrics, registrationNo }) => (
  <Card sx={{ borderRadius: 2, p: 2.5, boxShadow: '0 8px 24px rgba(14,28,48,0.06)', height: '100%', overflowY: 'auto' }}>
    <Box sx={{ mb: 3 }}>
      <Typography color="text.secondary" variant="body2">
        Registration No.
      </Typography>
      <Typography fontWeight="bold" variant="h6">
        {registrationNo !== 'All' ? registrationNo : 'N/A'}
      </Typography>
    </Box>

    <Grid container spacing={2}>
      {Object.entries(metrics)
        .filter(([key]) => key !== 'faults')
        .map(([key, { value, unit }]) => (
          <Grid item xs={6} key={key}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {value}
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {unit}
                </Typography>
              </Typography>
            </Paper>
          </Grid>
      ))}
    </Grid>

    <Box mt={2.5}>
       <Typography variant="body2" color="text.secondary" mb={1}>
         System Faults
       </Typography>
       <Chip
        icon={metrics.faults.value === 'None' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
        label={metrics.faults.value}
        color={metrics.faults.value === 'None' ? 'success' : 'error'}
        variant="outlined"
        sx={{ width: '100%', justifyContent: 'flex-start', p: 1 }}
       />
    </Box>
  </Card>
);


// Data (No changes)
const allVehicleData = [
  {
    id: 'EKA9-PMPML-01-D1',
    registrationNo: 'MH 14 AB 1234',
    type: 'EKA 9',
    fleet: 'PMPML',
    date: '2025-08-11',
    metrics: {
      speed: { value: '62', unit: 'kmph' },
      soc: { value: '88', unit: '%' },
      motorSpeed: { value: '1800', unit: 'rpm' },
      motorTorque: { value: '190', unit: 'nm' },
      acceleration: { value: '3.1', unit: 'km/s²' },
      brake: { value: '0', unit: '%' },
      faults: { value: 'None', unit: '' },
    },
    ecuData: [
      { name: 'BMS', controls: [{ name: 'Contactor Control', value: '1' }, { name: 'Enable', value: '1' }] },
      { name: 'Motor', controls: [{ name: 'Torque Command (Nm)', value: '1500' }, { name: 'Enable', value: '1' }] },
    ],
  },
  {
    id: 'EKA7-BEST-01-D1',
    registrationNo: 'MH 01 CD 5678',
    type: 'EKA 7',
    fleet: 'BEST',
    date: '2025-08-11',
    metrics: {
      speed: { value: '45', unit: 'kmph' },
      soc: { value: '95', unit: '%' },
      motorSpeed: { value: '1550', unit: 'rpm' },
      motorTorque: { value: '165', unit: 'nm' },
      acceleration: { value: '0', unit: 'km/s²' },
      brake: { value: '10', unit: '%' },
      faults: { value: 'Minor', unit: '' },
    },
    ecuData: [
      { name: 'BMS', controls: [{ name: 'Contactor Control', value: '2' }, { name: 'Enable', value: '0' }] },
      { name: 'HVPDU', controls: [{ name: 'Contactor Control', value: '3' }, { name: 'Enable', value: '1' }] },
    ],
  },
  {
    id: 'EKA7-BEST-01-D2',
    registrationNo: 'MH 01 CD 5679',
    type: 'EKA 7',
    fleet: 'BEST',
    date: '2025-08-10',
    metrics: {
      speed: { value: '51', unit: 'kmph' },
      soc: { value: '72', unit: '%' },
      motorSpeed: { value: '1600', unit: 'rpm' },
      motorTorque: { value: '170', unit: 'nm' },
      acceleration: { value: '2.5', unit: 'km/s²' },
      brake: { value: '0', unit: '%' },
      faults: { value: 'None', unit: '' },
    },
    ecuData: [
      { name: 'BMS', controls: [{ name: 'Contactor Control', value: '2' }, { name: 'Enable', value: '1' }] },
      { name: 'HVPDU', controls: [{ name: 'Contactor Control', value: '3' }, { name: 'Enable', value: '1' }] },
    ],
  },
];

const vehicleTypeOptions = ['All', ...new Set(allVehicleData.map((v) => v.type))];
const regNoOptions = ['All', ...new Set(allVehicleData.map((v) => v.registrationNo))];
const dateOptions = ['All', ...new Set(allVehicleData.map((v) => v.date))];
const fleetOptions = ['All', ...new Set(allVehicleData.map((v) => v.fleet))];


const TrailsPage = () => {
  const [isMapView, setIsMapView] = useState(true);
  const [topSelectedType, setTopSelectedType] = useState('All');
  const [topSelectedReg, setTopSelectedReg] = useState('All');
  const [topSelectedDate, setTopSelectedDate] = useState('All');
  const [vcuSelectedType, setVcuSelectedType] = useState('All');
  const [vcuSelectedFleet, setVcuSelectedFleet] = useState('All');
  const [vcuSelectedVehicleId, setVcuSelectedVehicleId] = useState(allVehicleData[0]?.id || '');

  const displayedVehicle = useMemo(() => {
    if (topSelectedReg !== 'All') {
      return allVehicleData.find(v => v.registrationNo === topSelectedReg);
    }
    return allVehicleData.find(
      (v) =>
        (topSelectedType === 'All' || v.type === topSelectedType) &&
        (topSelectedDate === 'All' || v.date === topSelectedDate)
    );
  }, [topSelectedType, topSelectedReg, topSelectedDate]);
  
  const displayedMetrics = displayedVehicle?.metrics;
  const displayedRegNo = displayedVehicle?.registrationNo || 'N/A';

  const vcuFilteredVehicleOptions = useMemo(() => {
    return allVehicleData.filter(
      (v) =>
        (vcuSelectedType === 'All' || v.type === vcuSelectedType) &&
        (vcuSelectedFleet === 'All' || v.fleet === vcuSelectedFleet)
    );
  }, [vcuSelectedType, vcuSelectedFleet]);

  useEffect(() => {
    if (!vcuFilteredVehicleOptions.some((v) => v.id === vcuSelectedVehicleId)) {
      setVcuSelectedVehicleId(vcuFilteredVehicleOptions[0]?.id || '');
    }
  }, [vcuFilteredVehicleOptions, vcuSelectedVehicleId]);

  const displayedEcuData = useMemo(() => {
    return allVehicleData.find((v) => v.id === vcuSelectedVehicleId)?.ecuData || [];
  }, [vcuSelectedVehicleId]);

  const handleShowDetails = () => setIsMapView(false);
  const handleShowMap = () => setIsMapView(true);

  return (
    // UPDATED: Main container now configured for full-screen flex layout
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      bgcolor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      p: { xs: 1, sm: 2, md: 3 },
      boxSizing: 'border-box'
    }}>
      <Box> {/* Header container for Title and Filters */}
        <Typography variant="h5" fontWeight="bold" mb={1}>
         Trails
       </Typography>

       <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 8px 24px rgba(14,28,48,0.04)' }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item><Typography variant="subtitle1" fontWeight="medium">Filters:</Typography></Grid>
            <Grid item><DropdownButton label="Vehicle Type" value={topSelectedType} onChange={setTopSelectedType} options={vehicleTypeOptions} /></Grid>
            <Grid item><DropdownButton label="Registration No" value={topSelectedReg} onChange={setTopSelectedReg} options={regNoOptions} /></Grid>
            <Grid item><DropdownButton label="Date" value={topSelectedDate} onChange={setTopSelectedDate} options={dateOptions} /></Grid>
        </Grid>
       </Paper>
      </Box>

      {/* UPDATED: Main Content Area now grows to fill available space */}
      <Box sx={{
        display: 'flex',
        gap: 3,
        flexDirection: {xs: 'column', md: 'row'},
        flexGrow: 1,
        minHeight: 0, // Important for flex-grow and scrolling
      }}>
        
        {/* Left: Map Container */}
        <Box sx={{
            position: 'relative',
            width: isMapView ? '100%' : { xs: '100%', md: '67%' },
            transition: 'width 0.7s ease-in-out',
            cursor: isMapView ? 'pointer' : 'default',
            height: '100%'
          }}
          onClick={isMapView ? handleShowDetails : undefined}
        >
          <Card sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
            {isMapView && (
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 2, bgcolor: 'rgba(0, 0, 0, 0.5)', color: 'white', borderRadius: 2, zIndex: 1 }}>
                <Typography variant="h6">Click to View Details</Typography>
              </Box>
            )}
            {!isMapView && (
              <IconButton 
                onClick={handleShowMap} 
                sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, bgcolor: 'white', '&:hover': { bgcolor: 'grey.200' } }}
              >
                <CloseFullscreenIcon />
              </IconButton>
            )}

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.04363249043!2d73.79292682944648!3d18.52456485994404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1723378857448!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, pointerEvents: isMapView ? 'none' : 'auto' }}
              loading="lazy"
              title="Vehicle Trail Map"
            />
          </Card>
        </Box>

        {/* Right: Vehicle Details Container */}
        <Box sx={{
          width: isMapView ? '0%' : { xs: '100%', md: '33%' },
          transition: 'width 0.7s ease-in-out',
          overflow: 'hidden',
          height: '100%'
        }}>
           {displayedMetrics ? (
            <VehicleDetailsCard metrics={displayedMetrics} registrationNo={displayedRegNo} />
           ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2, boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
              <Typography textAlign="center" color="text.secondary">
                No data available for the selected filters.
              </Typography>
            </Card>
           )}
        </Box>
      </Box>

      {/* VCU Telecontrol Section is pushed to the bottom by the flex-grow above */}
      <Box mt={3}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              alignItems: 'center',
              p: 2,
              gap: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              VCU Telecontrol
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <DropdownButton label="Vehicle Type" value={vcuSelectedType} onChange={setVcuSelectedType} options={vehicleTypeOptions} />
              <DropdownButton label="Fleet" value={vcuSelectedFleet} onChange={setVcuSelectedFleet} options={fleetOptions} />
              <DropdownButton
                label="Vehicle"
                value={vcuSelectedVehicleId || 'None'}
                onChange={setVcuSelectedVehicleId}
                options={vcuFilteredVehicleOptions.map((v) => v.id)}
              />
            </Box>
          </Box>
          <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
            {displayedEcuData.length === 0 ? (
              <Typography sx={{ p: 3, textAlign: 'center' }}>No ECU data available</Typography>
            ) : (
              displayedEcuData.map((ecu, i) => (
                 <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: i % 2 !== 0 ? 'white' : '#f5f7ff', borderTop: '1px solid #e0e0e0' }}>
                   <Box>
                     <Typography fontWeight="bold">{ecu.name}</Typography>
                     {ecu.controls.map((c) => (<Typography variant="body2" color="text.secondary" key={c.name} sx={{ mt: 0.5 }}>{c.name}</Typography>))}
                   </Box>
                   <Box sx={{ textAlign: 'right' }}>
                     {ecu.controls.map((c, index) => (<Typography key={c.name} sx={{ mt: index === 0 ? 2.5 : 0.5 }}>{c.value}</Typography>))}
                   </Box>
                 </Box>
              ))
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TrailsPage;