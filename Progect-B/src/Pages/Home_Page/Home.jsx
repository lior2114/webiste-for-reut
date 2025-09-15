import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Flight, Person, Star } from '@mui/icons-material';
import { useUi } from '../../Contexts/UiContext';
import { UseUser } from '../../Contexts/UserContexts';
import styles from './Home.module.css';

export function Home() {
  const navigate = useNavigate();
  const { language } = useUi();
  const { isAuthenticated } = UseUser();
  const t = (he, en) => (language === 'he' ? he : en);

  return (
    <Container maxWidth="lg">
      <Box className={styles.containerBox}>
        {/* Hero Section */}
        <Paper elevation={3} className={styles.heroPaper}>
          <Typography variant="h2" component="h1" gutterBottom className={styles.heroTitle} color="primary.main">
            {t('🌴 ברוכים הבאים למערכת החופשות', '🌴 Welcome to the Vacations System')}
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom className={styles.heroSubtitle} color="text.secondary">
            {t('מערכת לניהול חופשות מתקדמת', 'An advanced vacation management system')}
          </Typography>
          
          <Typography variant="body1" className={styles.heroBody}>
            {t('כאן תוכלו לראות חופשות, להירשם למערכת, ולהתחבר לחשבון שלכם', 'Here you can view vacations, register, and log in to your account')}
          </Typography>
          
          <Box className={styles.ctaRow}>
            {!isAuthenticated && (
              <>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  className={styles.ctaBtn}
                >
                  {t('הרשמה למערכת', 'Register')}
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  className={styles.ctaBtn}
                >
                  {t('התחברות', 'Login')}
                </Button>
              </>
            )}
            
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/vacations')}
              className={styles.ctaBtn}
            >
              {t('צפה בחופשות', 'Browse Vacations')}
            </Button>
          </Box>
        </Paper>

        {/* Features Section */}
        <Grid container spacing={{ xs: 2, md: 3 }} className={styles.featuresGrid} justifyContent="center">
          <Grid item xs={12} md={4} className={styles.featureItem}>
            <Paper elevation={2} className={styles.featurePaper}>
              <Flight className={styles.featureIcon} color="primary" />
              <Typography variant="h5" component="h3" gutterBottom>
                {t('חופשות מרהיבות', 'Stunning Vacations')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('גלה חופשות מדהימות ברחבי העולם עם מחירים משתלמים', 'Discover amazing vacations worldwide at great prices')}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4} className={styles.featureItem}>
            <Paper elevation={2} className={styles.featurePaper}>
              <Person className={styles.featureIcon} color="primary" />
              <Typography variant="h5" component="h3" gutterBottom>
                {t('ניהול חשבון', 'Account Management')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('ניהול אישי של החשבון שלך עם היסטוריית הזמנות', 'Manage your account with order history')}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4} className={styles.featureItem}>
            <Paper elevation={2} className={styles.featurePaper}>
              <Star className={styles.featureIcon} color="primary" />
              <Typography variant="h5" component="h3" gutterBottom>
                {t('חוות דעת', 'Reviews')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('קרא חוות דעת אמיתיות ממטיילים אחרים', 'Read real reviews from other travelers')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}


