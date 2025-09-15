import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Flight as FlightIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUi } from '../Contexts/UiContext';

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, mode, toggleLanguage, toggleMode } = useUi();
  
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: language === 'he' ? 'בית' : 'Home', path: '/', icon: <HomeIcon /> },
    { text: language === 'he' ? 'חופשות' : 'Vacations', path: '/vacations', icon: <FlightIcon /> },
    { text: language === 'he' ? 'אודות' : 'About', path: '/about', icon: <PersonIcon /> }
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', backdropFilter: 'blur(6px)' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          {language === 'he' ? '🌴 מערכת החופשות' : '🌴 Vacations System'}
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          {/* Theme toggle */}
          <Tooltip title={language === 'he' ? (mode === 'dark' ? 'מצב יום' : 'מצב לילה') : (mode === 'dark' ? 'Light mode' : 'Dark mode')}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Language toggle */}
          <Tooltip title={language === 'he' ? 'החלף שפה' : 'Toggle language'}>
            <IconButton color="inherit" onClick={toggleLanguage}>
              <TranslateIcon />
            </IconButton>
          </Tooltip>

          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              {item.text}
            </Button>
          ))}

        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
          <Button
            color="inherit"
            startIcon={<FlightIcon />}
            onClick={() => handleNavigation('/vacations/add')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}
          >
            {language === 'he' ? 'הוסף חופשה' : 'Add Vacation'}
          </Button>
        </Box>

        {/* Mobile Menu Button */}
        <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={handleMobileMenuOpen} sx={{ display: { xs: 'flex', md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Mobile Menu */}
      <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {menuItems.map((item) => (
          <MenuItem key={item.path} onClick={() => handleNavigation(item.path)} selected={isActive(item.path)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.icon}
              {item.text}
            </Box>
          </MenuItem>
        ))}
        <MenuItem onClick={() => handleNavigation('/vacations/add')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightIcon />
            {language === 'he' ? 'הוסף חופשה' : 'Add Vacation'}
          </Box>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
