import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, IconButton, Button, CircularProgress, MenuItem, Popover, TextField } from '@mui/material';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays } from 'date-fns';
import ReactApexChart from 'react-apexcharts';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import EventIcon from '@mui/icons-material/Event';
import api from '../api';

// --- Reusable ChartCard Component (No changes needed) ---
const ChartCard = ({ title, chartOptions, chartSeries, type, legendData }) => {
    const chartRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const handleFullscreen = () => { if (chartRef.current) { chartRef.current.chart.toggleFullscreen(); } };
    const memoizedOptions = useMemo(() => ({ ...chartOptions, chart: { ...chartOptions.chart, events: { mounted: (chart) => { chartRef.current = chart; }, fullscreen: (chart, isFs) => { setIsFullscreen(isFs); }, }, }, }), [chartOptions]);
    return (
        <Card sx={{ height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {legendData && legendData.map(item => ( <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}> <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} /> <Typography variant="body2">{item.name}</Typography> </Box> ))}
                        <IconButton onClick={handleFullscreen} size="small"> {isFullscreen ? <FullscreenExitRoundedIcon fontSize="small" /> : <OpenInNewIcon fontSize="small" />} </IconButton>
                    </Box>
                </Box>
            </CardContent>
            <Box sx={{ flexGrow: 1, minHeight: '250px', p: 0 }}>
                <ReactApexChart options={memoizedOptions} series={chartSeries} type={type} height="100%" width="100%" />
            </Box>
        </Card>
    );
};


const VehicleAnalysisPage = () => {
    const [filters, setFilters] = useState({ vehicleTypes: [], registrations: [] });
    const [selection, setSelection] = useState({ vehicleType: null, registration: null });
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState({ filters: true, charts: false });
    const [error, setError] = useState(null);

    // --- NEW: State for Date Range Picker ---
    const [datePickerAnchor, setDatePickerAnchor] = useState(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await api.get('/api/vehicle-analysis/?fetch_filters=true');
                setFilters(prev => ({ ...prev, vehicleTypes: response.data.filters }));
            } catch (err) {
                setError("Failed to load filter options.");
            } finally {
                setLoading(prev => ({ ...prev, filters: false }));
            }
        };
        fetchFilters();
    }, []);

    const handleSelectVehicleType = (type) => {
        setSelection({ vehicleType: type, registration: null });
        // Assuming the registrations are nested within the vehicle type object from the API
        setFilters(prev => ({ ...prev, registrations: type.registrations || [] }));
        setChartData(null);
    };

    const handleSelectRegistration = (reg) => {
        setSelection(prev => ({ ...prev, registration: reg }));
        setChartData(null);
    };
    
    // --- NEW: Handlers for Date Range Picker Popover ---
    const handleDateButtonClick = (event) => {
        setDatePickerAnchor(event.currentTarget);
    };
    const handleDatePickerClose = () => {
        setDatePickerAnchor(null);
    };
    const openDatePicker = Boolean(datePickerAnchor);

    // --- UPDATED: useEffect to fetch chart data ---
    useEffect(() => {
        const fetchChartData = async () => {
            // We only fetch if a vehicle is selected.
            if (selection.vehicleType && selection.registration) {
                try {
                    setLoading(prev => ({ ...prev, charts: true }));
                    setError(null);

                    // NOTE: The backend currently supports a single date.
                    // For this demonstration, we'll use the START date of our range.
                    // A real implementation would require the backend to accept a start_date and end_date.
                    const startDate = dateRange[0].startDate.toISOString().split('T')[0];

                    const response = await api.get(`/api/vehicle-analysis/?registration_id=${selection.registration.id}&date=${startDate}`);
                    setChartData(response.data.charts);
                } catch (err) {
                    // Handle cases where no data is found for the selected start date
                    if (err.response && err.response.status === 404) {
                        setError(`No data found for ${selection.registration.registration_number} on ${dateRange[0].startDate.toLocaleDateString()}.`);
                    } else {
                        setError("Failed to load chart data for the selected criteria.");
                    }
                    setChartData(null); // Clear previous data
                } finally {
                    setLoading(prev => ({ ...prev, charts: false }));
                }
            }
        };
        // Re-fetch data when the selection or the date range changes
        fetchChartData();
    }, [selection, dateRange]);

    const baseChartOptions = { chart: { toolbar: { show: false }, zoom: { enabled: false } }, dataLabels: { enabled: false }, stroke: { curve: 'smooth', width: 2 }, grid: { borderColor: '#e7e7e7', strokeDashArray: 5 }, xaxis: { labels: { style: { fontSize: '10px' } }, tooltip: { enabled: false } }, yaxis: { labels: { style: { fontSize: '10px' } } }, tooltip: { x: { show: false } } };

    if (loading.filters) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">Vehicle Analysis</Typography>
                
                {/* --- REDESIGNED Filter Section --- */}
                <Paper elevation={2} sx={{ display: 'flex', gap: 2, p: 1.5, borderRadius: 3 }}>
                    <TextField
                        select
                        label="Vehicle Type"
                        value={selection.vehicleType ? selection.vehicleType.id : ''}
                        onChange={(e) => {
                            const selectedType = filters.vehicleTypes.find(vt => vt.id === e.target.value);
                            handleSelectVehicleType(selectedType);
                        }}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="" disabled><em>Select Type</em></MenuItem>
                        {filters.vehicleTypes.map((option) => (
                            <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Registration No"
                        value={selection.registration ? selection.registration.id : ''}
                        onChange={(e) => {
                            const selectedReg = filters.registrations.find(r => r.id === e.target.value);
                            handleSelectRegistration(selectedReg);
                        }}
                        size="small"
                        disabled={!selection.vehicleType}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="" disabled><em>Select Registration</em></MenuItem>
                        {filters.registrations.map((option) => (
                            <MenuItem key={option.id} value={option.id}>{option.registration_number}</MenuItem>
                        ))}
                    </TextField>
                    
                    <Button
                        variant="contained"
                        startIcon={<EventIcon />}
                        onClick={handleDateButtonClick}
                        disabled={!selection.registration}
                    >
                        {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
                    </Button>
                    <Popover
                        open={openDatePicker}
                        anchorEl={datePickerAnchor}
                        onClose={handleDatePickerClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <DateRangePicker
                            onChange={item => setDateRange([item.selection])}
                            showSelectionPreview={true}
                            moveRangeOnFirstSelection={false}
                            months={2}
                            ranges={dateRange}
                            direction="horizontal"
                        />
                    </Popover>
                </Paper>
            </Box>

            {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}
            
            {loading.charts ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> :
             chartData ? (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}><ChartCard title="Battery" type="area" chartOptions={{ ...baseChartOptions, xaxis: { categories: chartData.battery_data.labels }, colors: ['#008FFB'] }} chartSeries={chartData.battery_data.series} /></Grid>
                    <Grid item xs={12} md={6}><ChartCard title="Temperature" type="area" chartOptions={{ ...baseChartOptions, xaxis: { categories: chartData.temperature_data.labels }, colors: ['#FEB019', '#00E396'] }} chartSeries={chartData.temperature_data.series} legendData={[{ name: 'Min Temp', color: '#FEB019' }, { name: 'Max Temp', color: '#00E396' }]} /></Grid>
                    <Grid item xs={12} md={6}><ChartCard title="Peak Voltage" type="line" chartOptions={{ ...baseChartOptions, stroke: { ...baseChartOptions.stroke, dashArray: [0, 5] }, xaxis: { categories: chartData.voltage_data.labels }, colors: ['#775DD0', '#546E7A'] }} chartSeries={chartData.voltage_data.series} legendData={[{ name: 'A Pack', color: '#775DD0' }, { name: 'B Pack', color: '#546E7A' }]} /></Grid>
                    <Grid item xs={12} md={6}><ChartCard title="Peak Current" type="line" chartOptions={{ ...baseChartOptions, stroke: { ...baseChartOptions.stroke, dashArray: [0, 5] }, xaxis: { categories: chartData.current_data.labels }, colors: ['#FF4560', '#00D9E9'] }} chartSeries={chartData.current_data.series} legendData={[{ name: 'Current', color: '#FF4560' }, { name: 'Peak', color: '#00D9E9' }]} /></Grid>
                </Grid>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center', mt: 2 }}><Typography>Please select a vehicle type and registration number to view analysis charts.</Typography></Card>
            )}
        </Box>
    );
};

export default VehicleAnalysisPage;