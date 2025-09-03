import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Avatar, Grid, List, ListItem, ListItemAvatar,
    ListItemText, Button, Divider, Chip, CircularProgress
} from '@mui/material';
import { 
    AdminPanelSettings, AddCircleOutline, DirectionsCar, PointOfSale, Build, Person
} from '@mui/icons-material';
import api from '../api';

const InfoCard = ({ title, children, action }) => (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                {title}
            </Typography>
            {action}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
            {children}
        </Box>
    </Paper>
);

const roleConfig = {
    admin: { icon: <AdminPanelSettings />, color: 'secondary', label: 'Superuser' },
    fleet_owner: { icon: <DirectionsCar />, color: 'primary', label: 'Fleet Owner' },
    sales: { icon: <PointOfSale />, color: 'success', label: 'Sales' },
    service: { icon: <Build />, color: 'warning', label: 'Service' },
    // Add a default for any other roles
    default: { icon: <Person />, color: 'default', label: 'User' },
};

const SuperuserPage = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users/list/');
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch user list. You may not have permission.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.is_staff) {
            fetchUsers();
        } else {
            setError('You do not have permission to view this page.');
            setLoading(false);
        }
    }, [currentUser]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
    }

    if (!currentUser) {
        return <Typography>Loading user information...</Typography>
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <InfoCard title="Administrator">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'secondary.main', fontSize: '2.5rem' }}>
                                {currentUser.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                {currentUser.username}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                                {currentUser.email}
                            </Typography>
                            <Chip 
                                icon={<AdminPanelSettings />} 
                                label="Full Access Privileges" 
                                color="secondary" 
                                size="small" 
                                variant="outlined"
                            />
                        </Box>
                    </InfoCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <InfoCard 
                        title="User Management"
                        action={
                            <Button variant="contained" startIcon={<AddCircleOutline />}>
                                Add User
                            </Button>
                        }
                    >
                        <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
                            {users.map((user, index) => {
                                const config = roleConfig[user.role] || roleConfig.default;
                                return (
                                    <React.Fragment key={user.id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: `${config.color}.light`, color: `${config.color}.main` }}>
                                                    {config.icon}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={user.username} 
                                                secondary={user.email} 
                                            />
                                            <Chip label={config.label} color={config.color} size="small" />
                                        </ListItem>
                                        {index < users.length - 1 && <Divider component="li" variant="inset" />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </InfoCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SuperuserPage;