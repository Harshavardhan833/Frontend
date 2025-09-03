import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Grid, Card, CardContent, Chip, IconButton, CircularProgress
} from '@mui/material';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PowerOutlinedIcon from '@mui/icons-material/PowerOutlined';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { CloseFullscreen as CloseFullscreenIcon } from '@mui/icons-material';
import api from '../api'; // Your centralized Axios API client

/**
 * A reusable custom hook to fetch data from the API.
 * It manages loading, error, and data states automatically.
 * @param {string} url - The API endpoint to fetch from.
 * @returns {object} An object containing data, loading, and error states.
 */
const useApiData = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(url);
                setData(response.data);
            } catch (err) {
                setError('Failed to load data. Please check your connection or log in again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);

    return { data, loading, error };
};

const SummaryCard = ({ title, value, unit }) => (
    <Card sx={{ borderRadius: 2, textAlign: 'center', height: '100%', boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
        <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h5" fontWeight="bold">
                {value}
                {unit && <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>{unit}</Typography>}
            </Typography>
        </CardContent>
    </Card>
);

const VehicleInfoCard = ({ vehicle }) => {
    const dataPoints = [
        { value: `${vehicle.speed} kmph`, icon: <SpeedOutlinedIcon color="action" /> },
        { value: `${vehicle.soc}%`, icon: <PowerOutlinedIcon color="action" /> },
        { value: `${vehicle.range} kms`, icon: <AltRouteOutlinedIcon color="action" /> },
        { value: `${vehicle.temp}°C`, icon: <ThermostatOutlinedIcon color="action" /> },
    ];
    return (
        <Card sx={{ borderRadius: 2, p: 2, boxShadow: '0 8px 24px rgba(14,28,48,0.06)', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography color="text.secondary" variant="body2">VRN Number</Typography>
                    <Typography fontWeight="bold">{vehicle.name}</Typography>
                </Box>
                <Chip icon={<StarBorderOutlinedIcon />} label={vehicle.rating} variant="outlined" size="small" />
            </Box>
            <Grid container spacing={1} sx={{ textAlign: 'center' }}>
                {dataPoints.map((point, index) => (
                    <Grid item xs={3} key={index}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            {point.icon}
                            <Typography variant="body1" fontWeight="medium">{point.value}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {vehicle.address}
            </Typography>
        </Card>
    );
};

const VehicleSelectionPage = () => {
    // 1. First API Call: Get the list of vehicles and summary data
    const { data: selectionData, loading: selectionLoading, error: selectionError } = useApiData('/api/vehicle-selection/');
    
    // State for the second API call's data (the trail path)
    const [trailPath, setTrailPath] = useState([]);
    const [trailLoading, setTrailLoading] = useState(true);

    // State for the UI view
    const [isMapView, setIsMapView] = useState(true);

    // 2. Second API Call: Triggered after the first one succeeds
    useEffect(() => {
        const fetchTrailData = async () => {
            if (!selectionData || !selectionData.vehicle_list || selectionData.vehicle_list.length === 0) {
                if (!selectionLoading) setTrailLoading(false);
                return;
            }

            try {
                const firstVehicle = selectionData.vehicle_list[0];
                const today = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD

                const trailResponse = await api.get(`/api/trails/?vehicle_id=${firstVehicle.id}&date=${today}`);
                setTrailPath(trailResponse.data.trail_path);
            } catch (err) {
                console.error("Failed to load trail data.", err);
            } finally {
                setTrailLoading(false);
            }
        };

        fetchTrailData();
    }, [selectionData, selectionLoading]); // Dependency array ensures this runs when selectionData is ready

    const handleShowDetails = () => setIsMapView(false);
    const handleShowMap = () => setIsMapView(true);

    // Display loading spinner until both API calls are complete
    if (selectionLoading || trailLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (selectionError) {
        return <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="error">{selectionError}</Typography></Box>;
    }

    // Use optional chaining and default empty arrays for robust rendering
    const summaryData = selectionData?.summary_data || [];
    const vehicleList = selectionData?.vehicles || [];
    
    // Note: A production app would pass `trailPath` to a proper map library 
    // (like @react-google-maps/api) to draw a polyline on the map.
    console.log("Trail path to draw on map:", trailPath);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', p: 3, boxSizing: 'border-box' }}>
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold" mb={2}>{selectionData?.fleet_name || 'Fleet'} Details</Typography>
                <Grid container spacing={2}>
                    {summaryData.map((item) => (
                        <Grid item xs={12} sm={4} md={2} key={item.title}><SummaryCard {...item} /></Grid>
                    ))}
                </Grid>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, flexGrow: 1, minHeight: 0 }}>
                <Box sx={{ position: 'relative', width: isMapView ? '100%' : { xs: '100%', md: 'calc(100% - 344px)' }, transition: 'width 0.5s ease-in-out', cursor: isMapView ? 'pointer' : 'default', height: { xs: 300, md: 'auto' } }} onClick={isMapView ? handleShowDetails : undefined}>
                    <Card sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
                        {isMapView && (<Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 2, bgcolor: 'rgba(0, 0, 0, 0.5)', color: 'white', borderRadius: 2, zIndex: 1, textAlign: 'center' }}><Typography variant="h6">Click to View Vehicle Details</Typography></Box>)}
                        {!isMapView && (<IconButton onClick={handleShowMap} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, bgcolor: 'white', '&:hover': { bgcolor: 'grey.200' } }}><CloseFullscreenIcon /></IconButton>)}
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15119.22153240003!2d73.8567436!3d18.6729584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b865d623b207%3A0x4642795c6c641124!2sNanekarwadi%2C%20Maharashtra%2C%20India!5e0!3m2!1sen!2sus!4v1692882000000" style={{ width: '100%', height: '100%', border: 0, pointerEvents: isMapView ? 'none' : 'auto' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Fleet Location Map"></iframe>
                    </Card>
                </Box>
                <Box sx={{ width: isMapView ? '0px' : { xs: '100%', md: '320px' }, transition: 'width 0.5s ease-in-out', overflow: 'hidden', flexShrink: 0, height: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflowY: 'auto', pr: 1 }}>
                        {vehicleList.map((vehicle) => (<VehicleInfoCard key={vehicle.name} vehicle={vehicle} />))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default VehicleSelectionPage;