import React from 'react';
import { AppBar, Box, Container, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  }),
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
}));

const Layout = ({ children, userType }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const jobSeekerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/jobseeker/dashboard' },
    { text: 'Skills', icon: <SchoolIcon />, path: '/jobseeker/skills' },
    { text: 'Research Papers', icon: <WorkIcon />, path: '/jobseeker/research-papers' },
    { text: 'Profile', icon: <PersonIcon />, path: '/jobseeker/edit-profile' },
  ];

  const employerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/employer/dashboard' },
    { text: 'Post Job', icon: <WorkIcon />, path: '/employer/post-job' },
    { text: 'Profile', icon: <PersonIcon />, path: '/employer/edit-profile' },
  ];

  const menuItems = userType === 'jobseeker' ? jobSeekerMenuItems : employerMenuItems;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" color="primary">
          Job Skill Matcher
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            component="button"
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light + '20',
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '30',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem component="button" onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Job Skill Matcher
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: theme.palette.background.paper,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Main open={!isMobile}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Main>
    </Box>
  );
};

export default Layout;
