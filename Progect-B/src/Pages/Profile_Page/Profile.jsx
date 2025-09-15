import React, { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, Avatar, Divider, Grid, Alert } from '@mui/material';
import { UseUser } from '../../Contexts/UserContexts';
import { useNavigate } from 'react-router-dom';
import { useUi } from '../../Contexts/UiContext';
import { getLikes, getVacations } from '../../api/api';
import styles from './Profile.module.css';

export function Profile() {
  const { isAuthenticated, user } = UseUser();
  const { language } = useUi();
  const navigate = useNavigate();
  const [liked, setLiked] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [likesData, vacationsData] = await Promise.all([getLikes(), getVacations()]);
        const myLikes = Array.isArray(likesData)
          ? likesData.filter(l => Number(l.user_id) === Number(user.user_id))
          : [];
        const likedVacationIds = new Set(myLikes.map(m => Number(m.vacation_id)));
        const likedVacations = Array.isArray(vacationsData)
          ? vacationsData.filter(v => likedVacationIds.has(Number(v.vacation_id)))
          : [];
        setLiked(likedVacations);
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      }
    };
    fetchData();
  }, [isAuthenticated, navigate, user]);

  return (
    <Container maxWidth="md">
      <Box className={styles.containerBox}>
        <Paper elevation={3} className={styles.paper}>
          <Box className={styles.userRow}>
            <Avatar sx={{ width: 56, height: 56 }}>
              {user?.first_name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h5" className={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.user_email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" className={styles.sectionTitle}>
            {language === 'he' ? 'חופשות שאהבת' : 'Liked Vacations'}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            {liked.map(v => (
              <Grid item xs={12} sm={6} md={4} key={v.vacation_id}>
                <Paper className={styles.vacationCard}>
                  <Typography variant="subtitle1" className={styles.userName}>{v.country_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{v.vacation_description}</Typography>
                </Paper>
              </Grid>
            ))}
            {liked.length === 0 && !error && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {language === 'he' ? 'אין חופשות שאהבת עדיין.' : 'No liked vacations yet.'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}


