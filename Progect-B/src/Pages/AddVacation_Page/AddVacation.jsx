import React from 'react';
import { Container, Typography, Paper, Alert, TextField, Grid, Button, Box } from '@mui/material';
import styles from './AddVacation.module.css';
import { Event, AttachMoney, Description, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createVacation } from '../../api/api';
import { useUi } from '../../Contexts/UiContext';

export function AddVacation() {
  const navigate = useNavigate();
  const { language } = useUi();

  const [form, setForm] = React.useState({
    vacation_destination: '',
    vacation_description: '',
    vacation_start_date: '',
    vacation_end_date: '',
    vacation_price: '',
    vacation_image: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const t = (he, en) => (language === 'he' ? he : en);

  const validate = () => {
    if (!form.vacation_destination.trim()) return t('נא להזין יעד', 'Please enter destination');
    if (!form.vacation_description.trim()) return t('נא להזין תיאור', 'Please enter description');
    if (!form.vacation_start_date) return t('נא להזין תאריך התחלה', 'Please enter start date');
    if (!form.vacation_end_date) return t('נא להזין תאריך סיום', 'Please enter end date');
    if (!form.vacation_price || isNaN(form.vacation_price)) return t('נא להזין מחיר תקין', 'Please enter valid price');
    if (new Date(form.vacation_start_date) >= new Date(form.vacation_end_date)) {
      return t('תאריך הסיום חייב להיות אחרי תאריך ההתחלה', 'End date must be after start date');
    }
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setSubmitting(true);
    try {
      const vacationData = {
        vacation_destination: form.vacation_destination,
        vacation_description: form.vacation_description,
        vacation_start_date: form.vacation_start_date,
        vacation_end_date: form.vacation_end_date,
        vacation_price: parseFloat(form.vacation_price),
        vacation_image: form.vacation_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60'
      };
      await createVacation(vacationData);
      navigate('/vacations');
    } catch (e) {
      setError(e.message || t('שמירה נכשלה', 'Save failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <Container maxWidth="md">
      <Paper className={styles.paper}>
        <Typography variant="h4" gutterBottom>{t('הוספת חופשה', 'Add Vacation')}</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="vacation_destination"
                label={t('יעד החופשה', 'Vacation Destination')}
                value={form.vacation_destination}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <AttachMoney /> }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="vacation_description"
                label={t('תיאור החופשה', 'Vacation Description')}
                value={form.vacation_description}
                onChange={handleChange}
                multiline
                rows={3}
                required
                InputProps={{ startAdornment: <Description /> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vacation_start_date"
                label={t('תאריך התחלה', 'Start Date')}
                type="date"
                value={form.vacation_start_date}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <Event /> }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vacation_end_date"
                label={t('תאריך סיום', 'End Date')}
                type="date"
                value={form.vacation_end_date}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <Event /> }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vacation_price"
                label={t('מחיר', 'Price')}
                type="number"
                value={form.vacation_price}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <AttachMoney /> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vacation_image"
                label={t('קישור לתמונה', 'Image URL')}
                value={form.vacation_image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                InputProps={{ startAdornment: <ImageIcon /> }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/vacations')}
                  disabled={submitting}
                >
                  {t('ביטול', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                >
                  {submitting ? t('שומר...', 'Saving...') : t('שמור', 'Save')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}