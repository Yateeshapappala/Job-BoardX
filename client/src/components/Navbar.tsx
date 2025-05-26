
import React, { useEffect, useState } from 'react';
import {
  AppBar,Toolbar,Button,Box,Typography,Container,IconButton,Drawer,List,ListItem,ListItemButton,ListItemText,Avatar,Menu,MenuItem,Tooltip} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Link } from 'react-router-dom';
import { decodeToken } from '../utils/decodeToken';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      const decoded = token ? decodeToken(token) : null;
    
      if (decoded && decoded.role) {
        setRole(decoded.role);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('token'); // Clean up expired/invalid token
        setRole(null);
        setIsLoggedIn(false);
      }
    };
    

    checkToken();
    window.addEventListener('authChange', checkToken);
    return () => window.removeEventListener('authChange', checkToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    setIsLoggedIn(false);
    setRole(null);
    navigate('/');
  };

  const navItems = () => {
    if (!isLoggedIn) return [];
    if (role === 'JobSeeker') {
      return [
        { label: 'Jobs', to: '/jobs' },
        { label: 'Saved Jobs', to: '/saved-jobs' },
        { label: 'My Applications', to: '/my-applications' },
      ];
    }
    if (role === 'Employer') {
      return [
        { label: 'Post Job', to: '/post-job' },
        { label: 'My Jobs', to: '/my-jobs' },
      ];
    }
    return [];
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              component={Link}
              to="/"
              variant="h5"
              sx={{
                color: '#7A5FFF',
                fontWeight: 800,
                fontFamily: 'Poppins, sans-serif',
                textDecoration: 'none',
              }}
            >
              JobBoardX
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              {navItems().map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.to}
                  sx={{
                    color: '#1E293B',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontFamily: 'Poppins, sans-serif',
                    '&:hover': { color: '#7A5FFF' },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {isLoggedIn && (
                <>
                  <Tooltip title="Account">
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#7A5FFF' }} />
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <MenuItem component={Link} to={role === 'JobSeeker' ? '/profile/me' : '/profile'} onClick={() => setAnchorEl(null)}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              )}

              {!isLoggedIn && (
                <>
                  <Button component={Link} to="/login" sx={{ textTransform: 'none' }}>
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      backgroundColor: '#7A5FFF',
                      color: '#fff',
                      borderRadius: 999,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { backgroundColor: '#6B4EFF' },
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile Menu Icon */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <IconButton onClick={() => setOpenDrawer(true)}>
                <MenuIcon sx={{ color: '#1E293B' }} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {navItems().map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton component={Link} to={item.to} onClick={() => setOpenDrawer(false)}>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {isLoggedIn ? (
              <>
                <ListItemButton component={Link} to={role === 'JobSeeker' ? '/profile/me' : '/profile'} onClick={() => setOpenDrawer(false)}>
                  <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{ color: '#EF4444', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}
                  />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton component={Link} to="/login">
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton component={Link} to="/register">
                  <ListItemText primary="Register" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
