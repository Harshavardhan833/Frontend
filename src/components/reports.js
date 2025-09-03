import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, MenuItem, TablePagination, TextField, Popover } from '@mui/material';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { Event as EventIcon } from '@mui/icons-material';
import api from '../api';

const ReportsPage = () => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({ reportTypes: [], vehicleTypes: [], registrations: {} });
    const [selection, setSelection] = useState({ reportType: '', vehicleType: '', registrationNo: '' });
    const [loading, setLoading] = useState({ filters: true, reports: true });
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowCount, setRowCount] = useState(0);
    const [datePickerAnchor, setDatePickerAnchor] = useState(null);
    const [dateRange, setDateRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    }]);

    const rowsPerPage = 10;

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await api.get('/api/reports/?fetch_filters=true');
                setFilters(response.data);
            } catch (err) {
                setError("Failed to load filter options.");
            } finally {
                setLoading(prev => ({ ...prev, filters: false }));
            }
        };
        fetchFilters();
    }, []);

    const fetchReports = useCallback(async () => {
        setLoading(prev => ({ ...prev, reports: true }));
        setError(null);
        try {
            const params = new URLSearchParams();
            if (selection.reportType) params.append('report_type', selection.reportType);
            if (selection.vehicleType) params.append('vehicle_type', selection.vehicleType);
            if (selection.registrationNo) params.append('registration_no', selection.registrationNo);
            
            params.append('start_date', format(dateRange[0].startDate, 'yyyy-MM-dd'));
            params.append('end_date', format(dateRange[0].endDate, 'yyyy-MM-dd'));
            params.append('page', page + 1);
            
            const response = await api.get(`/api/reports/?${params.toString()}`);
            
            if (response.data && typeof response.data === 'object' && 'results' in response.data) {
                setReportData(response.data.results || []);
                setRowCount(response.data.count || 0);
            } else {
                setError("Received an invalid response from the server.");
                setReportData([]);
                setRowCount(0);
            }
        } catch (err) {
            setError("Failed to load reports.");
            setReportData([]); 
            setRowCount(0);
        } finally {
            setLoading(prev => ({ ...prev, reports: false }));
        }
    }, [selection, page, dateRange]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleFilterChange = (filterName, value) => {
        const newSelection = { ...selection, [filterName]: value };
        if (filterName === 'vehicleType') {
            newSelection.registrationNo = '';
        }
        setSelection(newSelection);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const registrationOptions = (selection.vehicleType && filters.registrations) ? filters.registrations[selection.vehicleType] || [] : [];

    const handleDateButtonClick = (event) => setDatePickerAnchor(event.currentTarget);
    const handleDatePickerClose = () => setDatePickerAnchor(null);
    const openDatePicker = Boolean(datePickerAnchor);

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>Reports</Typography>

            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField select label="Report Type" value={selection.reportType} onChange={(e) => handleFilterChange('reportType', e.target.value)} size="small" sx={{ minWidth: 180 }}>
                    <MenuItem value=""><em>All Types</em></MenuItem>
                    {[...new Set(filters.reportTypes)]?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
                <TextField select label="Vehicle Type" value={selection.vehicleType} onChange={(e) => handleFilterChange('vehicleType', e.target.value)} size="small" sx={{ minWidth: 180 }}>
                    <MenuItem value=""><em>All Types</em></MenuItem>
                    {filters.vehicleTypes?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
                <TextField select label="Registration No" value={selection.registrationNo} onChange={(e) => handleFilterChange('registrationNo', e.target.value)} size="small" disabled={!selection.vehicleType} sx={{ minWidth: 180 }}>
                    <MenuItem value=""><em>All Registrations</em></MenuItem>
                    {registrationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
                <Button variant="contained" startIcon={<EventIcon />} onClick={handleDateButtonClick}>
                    {`${format(dateRange[0].startDate, 'MMM d, yyyy')} - ${format(dateRange[0].endDate, 'MMM d, yyyy')}`}
                </Button>
                <Popover open={openDatePicker} anchorEl={datePickerAnchor} onClose={handleDatePickerClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                    <DateRangePicker
                        onChange={item => { setDateRange([item.selection]); setPage(0); }}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                    />
                </Popover>
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' } }}>
                                <TableCell>Name</TableCell>
                                <TableCell>Vehicle Type</TableCell>
                                <TableCell>Registration</TableCell>
                                <TableCell>Report Type</TableCell>
                                <TableCell>Date Created</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading.reports ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ p: 4 }}><CircularProgress /></TableCell></TableRow>
                            ) : error ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ p: 4 }}><Typography color="error">{error}</Typography></TableCell></TableRow>
                            ) : reportData.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ p: 4 }}>No reports found for the selected filters.</TableCell></TableRow>
                            ) : (
                                reportData.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell component="th" scope="row">{row.name}</TableCell>
                                        <TableCell>{row.vehicle_type}</TableCell>
                                        <TableCell>{row.registration_number}</TableCell>
                                        <TableCell>{row.report_type}</TableCell>
                                        {/* FIX: Use row.name, which is already formatted */}
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell align="center"><Button variant="text" size="small">View</Button></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}
                    rowsPerPageOptions={[rowsPerPage]}
                    component="div"
                    count={rowCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                />
            </Paper>
        </Box>
    );
};

export default ReportsPage;