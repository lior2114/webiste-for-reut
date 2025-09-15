import React from 'react';
import { Container, Typography, Paper, Alert, TextField, Grid, Button, Box, InputAdornment } from '@mui/material';
import styles from './AddVacation.module.css';
import { Event, Public, AttachMoney, Description, Image as ImageIcon } from '@mui/icons-material';
import { UseUser } from '../../Contexts/UserContexts';
import { useNavigate } from 'react-router-dom';
import { createVacation, getCountries, createCountry } from '../../api/api';
import { useUi } from '../../Contexts/UiContext';

export function AddVacation() {
  const { isAuthenticated, user } = UseUser();
  const navigate = useNavigate();
  const isAdmin = Boolean(user && Number(user.role_id) === 1);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/vacations');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const [form, setForm] = React.useState({
    country_id: '',
    vacation_description: '',
    vacation_start: '',
    vacation_ends: '',
    vacation_price: '',
    file: null,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [countries, setCountries] = React.useState([]);
  const [countryQuery, setCountryQuery] = React.useState('');
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [worldCountries, setWorldCountries] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = React.useState(null);

  React.useEffect(()=>{
    const load = async ()=>{
      try{
        const c = await getCountries();
        setCountries(Array.isArray(c)? c: []);
      }catch{}
      try{
        const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,translations');
        const data = await resp.json();
        const list = Array.isArray(data) ? data.map((item)=>({
          code: item.cca3 || item.cca2,
          name_en: item?.name?.common || '',
          name_he: item?.translations?.heb?.common || item?.name?.common || '',
        })) : [];
        setWorldCountries(list.sort((a,b)=> (a.name_en||'').localeCompare(b.name_en||'')));
      }catch{}
    };
    load();
  },[]);

  const { language, currency, setCurrency } = useUi();
  const currencySymbol = currency === 'ILS' ? '₪' : currency === 'EUR' ? '€' : '$';

  const t = (he, en) => (language === 'he' ? he : en);

  const validate = () => {
    if (!selectedCountry || !(selectedCountry.name_en || selectedCountry.name_he)) {
      return t('נא לבחור מדינה (אם רוצה להוסיף מדינה חדשה לגמרי נא לפנות למנהל הראשי)', 'Please select a country (to add a completely new country, contact the main admin)');
    }
    if (!form.vacation_description || !form.vacation_start || !form.vacation_ends || !form.vacation_price) {
      return t('כל השדות חובה', 'All fields are required');
    }
    const price = Number(form.vacation_price);
    if (isNaN(price) || price < 0 || price > 10000) {
      return 'מחיר חייב להיות בין 0 ל־10,000';
    }
    const start = new Date(form.vacation_start);
    const end = new Date(form.vacation_ends);
    const today = new Date(); today.setHours(0,0,0,0);
    if (start < today || end < today) {
      return 'לא ניתן לבחור תאריכי עבר';
    }
    if (end < start) {
      return 'תאריך סיום לא יכול להיות לפני תאריך התחלה';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');
    setSubmitting(true);
    try {
      const data = new FormData();
      // require selection from list; create if not in DB
      let countryId = form.country_id;
      if (!countryId){
        try{
          const created = await createCountry(language==='he' ? selectedCountry.name_he : selectedCountry.name_en);
          const row = Array.isArray(created)? created[0] : created;
          countryId = row?.country_id;
        }catch(e){ setError(e.message || 'יצירת מדינה נכשלה'); setSubmitting(false); return; }
      }
      data.append('country_id', countryId);
      data.append('vacation_description', form.vacation_description);
      data.append('vacation_start', form.vacation_start);
      data.append('vacation_ends', form.vacation_ends);
      data.append('vacation_price', form.vacation_price);
      data.append('file', form.file);
      // persist currency per vacation
      data.append('currency', currency);
      // ensure admin id is sent for auth
      data.append('admin_user_id', user?.user_id || '');
      await createVacation(data);
      navigate('/vacations');
    } catch (e) {
      setError(e.message || 'שמירה נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm((p) => ({ ...p, file: files?.[0] || null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  return (
    <Container maxWidth="md">
      <Paper className={styles.paper}>
        <Typography variant="h4" gutterBottom>{t('הוספת חופשה', 'Add Vacation')}</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label={t('בחר מדינה', 'Select country')}
                value={countryQuery}
                onChange={(e)=> setCountryQuery(e.target.value)}
                placeholder={t('התחל להקליד כדי לסנן או להוסיף', 'Type to filter or add')}
                InputProps={{ startAdornment: <InputAdornment position="start"><Public /></InputAdornment> }}
                aria-autocomplete="list"
                aria-controls="countries-add-list"
                role="combobox"
                onFocus={()=> setPanelOpen(true)}
                onBlur={()=> setTimeout(()=> setPanelOpen(false), 150)}
              />
              {panelOpen && (
                <Box id="countries-add-list" role="listbox" aria-label="רשימת מדינות" className={`${styles.countryList} ${document?.documentElement?.dataset?.theme === 'dark' ? styles.countryListDark : styles.countryListLight}`}>
                  {worldCountries
                    .filter((c)=> {
                      const q = countryQuery.trim().toLowerCase();
                      const he = (c.name_he||'').toLowerCase();
                      const en = (c.name_en||'').toLowerCase();
                      return he.includes(q) || en.includes(q);
                    })
                    .slice(0, 200)
                    .map((c,idx)=> {
                      const match = countries.find((db)=> String(db.country_name).toLowerCase() === (language==='he' ? (c.name_he||'').toLowerCase() : (c.name_en||'').toLowerCase()));
                      return (
                        <Box key={`${c.code}-${idx}`} role="option" onMouseDown={(e)=> e.preventDefault()} onClick={()=> { setForm((p)=> ({...p, country_id: match?.country_id || '' })); setSelectedCountry(c); setCountryQuery(language==='he' ? c.name_he : c.name_en); setPanelOpen(false); }} className={styles.countryOption}>
                          {language==='he' ? c.name_he : c.name_en}
                        </Box>
                      );
                    })}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('מחיר', 'Price')}
                name="vacation_price"
                value={form.vacation_price}
                onChange={handleChange}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className={styles.currencySymbol}>{currencySymbol}</span>
                    </InputAdornment>
                  ),
                }}
                required
              />
              <Box className={styles.priceButtons}>
                <Button size="small" className={styles.currencyBtn} variant={currency==='ILS'?'contained':'outlined'} onClick={()=> setCurrency('ILS')}>₪ ILS</Button>
                <Button size="small" className={styles.currencyBtn} variant={currency==='USD'?'contained':'outlined'} onClick={()=> setCurrency('USD')}>$ USD</Button>
                <Button size="small" className={styles.currencyBtn} variant={currency==='EUR'?'contained':'outlined'} onClick={()=> setCurrency('EUR')}>€ EUR</Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={t('תיאור', 'Description')} name="vacation_description" value={form.vacation_description} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><Description /></InputAdornment> }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('תאריך התחלה', 'Start date')} name="vacation_start" type="date" value={form.vacation_start} onChange={handleChange}
                InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Event /></InputAdornment> }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('תאריך סיום', 'End date')} name="vacation_ends" type="date" value={form.vacation_ends} onChange={handleChange}
                InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Event /></InputAdornment> }} required />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<ImageIcon />}>{t('העלה תמונה', 'Upload image')}
                <input hidden type="file" name="file" accept="image/*" onChange={handleChange} />
              </Button>
              <Typography variant="caption" sx={{ ml: 2 }}>{form.file?.name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={submitting}>{t('שמור', 'Save')}</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}


