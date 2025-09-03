import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Divider,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const SettingsPage = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Settings
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
                        <Typography variant="h6" gutterBottom>
                            Profile Information
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Username" defaultValue="Admin" variant="outlined" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email Address" defaultValue="admin@eka.com" variant="outlined" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Bio" multiline rows={3} placeholder="Tell us about yourself" variant="outlined" />
                            </Grid>
                            <Grid item xs={12} sx={{ textAlign: 'right' }}>
                                <Button variant="contained" startIcon={<SaveIcon />}>
                                    Save Profile
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 24px rgba(14,28,48,0.06)' }}>
                        <Typography variant="h6" gutterBottom>
                            Application Settings
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Enable Email Notifications"
                            />
                            <Typography variant="caption" color="text.secondary" display="block">
                                Receive updates and alerts via email.
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <FormControlLabel
                                control={<Switch />}
                                label="Enable Dark Mode"
                            />
                             <Typography variant="caption" color="text.secondary" display="block">
                                Switch between light and dark themes (functionality to be implemented).
                            </Typography>
                        </Box>
                         <Box mt={3} sx={{ textAlign: 'right' }}>
                            <Button variant="contained" startIcon={<SaveIcon />}>
                                Save Settings
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SettingsPage;