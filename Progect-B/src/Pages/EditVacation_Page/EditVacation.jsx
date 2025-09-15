import React from 'react';
import { Container, Typography, Paper, Alert, TextField, Grid, Button, Box, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import { Event, Public, Description, Image as ImageIcon } from '@mui/icons-material';
import { UseUser } from '../../Contexts/UserContexts';
import { useUi } from '../../Contexts/UiContext';
import { useNavigate, useParams } from 'react-router-dom';
import { updateVacation, getVacationById, getCountries, createCountry } from '../../api/api';
import styles from './EditVacation.module.css';

export function EditVacation() {
  const { isAuthenticated, user } = UseUser();
  const navigate = useNavigate();
  const { id } = useParams();
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
  const { language, currency, setCurrency } = useUi();
  const currencySymbol = currency === 'ILS' ? '₪' : currency === 'EUR' ? '€' : '$';
  const t = (he, en) => (language === 'he' ? he : en);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [countries, setCountries] = React.useState([]);
  const [countryQuery, setCountryQuery] = React.useState('');
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [worldCountries, setWorldCountries] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [removeImage, setRemoveImage] = React.useState(false);
  const [currentImage, setCurrentImage] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      try {
        const v = await getVacationById(id);
        setForm({
          country_id: v.country_id || '',
          vacation_description: v.vacation_description || '',
          vacation_start: v.vacation_start || '',
          vacation_ends: v.vacation_ends || '',
          vacation_price: v.vacation_price || '',
          file: null,
        });
        setCurrentImage(v.vacation_file_name || '');
        // Initialize UI currency from the vacation if provided
        if (v.currency) {
          setCurrency(v.currency);
        }
        const c = await getCountries();
        setCountries(Array.isArray(c) ? c : []);
        try{
          const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,translations');
          const data = await resp.json();
          const list = Array.isArray(data) ? data.map((item)=>(
            {
              code: item.cca3 || item.cca2,
              name_en: item?.name?.common || '',
              name_he: item?.translations?.heb?.common || item?.name?.common || '',
            }
          )) : [];
          setWorldCountries(list.sort((a,b)=> (a.name_en||'').localeCompare(b.name_en||'')));
        }catch{}
      } catch (e) {
        setError(e.message || 'טעינת החופשה נכשלה');
      }
    };
    load();
  }, [id]);

  const validate = () => {
    if ((!form.country_id && !selectedCountry) || !form.vacation_description || !form.vacation_start || !form.vacation_ends || !form.vacation_price) {
      return 'כל השדות חובה';
    }
    const price = Number(form.vacation_price);
    if (isNaN(price) || price < 0 || price > 10000) {
      return 'מחיר חייב להיות בין 0 ל־10,000';
    }
    const start = new Date(form.vacation_start);
    const end = new Date(form.vacation_ends);
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
      let countryId = form.country_id;
      if (!countryId && selectedCountry){
        try{
          const created = await createCountry(language==='he' ? selectedCountry.name_he : selectedCountry.name_en);
          const row = Array.isArray(created)? created[0] : created;
          countryId = row?.country_id;
        }catch(err){ setError(err.message || 'יצירת מדינה נכשלה'); setSubmitting(false); return; }
      }
      data.append('country_id', countryId);
      data.append('vacation_description', form.vacation_description);
      data.append('vacation_start', form.vacation_start);
      data.append('vacation_ends', form.vacation_ends);
      data.append('vacation_price', form.vacation_price);
      // Persist currency on update, same as in AddVacation
      data.append('currency', currency);
      if (form.file) data.append('file', form.file);
      if (removeImage && !form.file) {
        data.append('remove_image', '1');
      }
      data.append('admin_user_id', user?.user_id || '');
      await updateVacation(id, data);
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

  const filteredCountries = React.useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    const list = Array.isArray(worldCountries) ? worldCountries : [];
    if (!q) return list;
    return list.filter((c)=> (c.name_he||'').toLowerCase().includes(q) || (c.name_en||'').toLowerCase().includes(q));
  }, [worldCountries, countryQuery]);

  return (
    <Container maxWidth="md">
      <Paper className={styles.paper}>
        <Typography variant="h4" gutterBottom>עריכת חופשה #{id}</Typography>
        {error && <Alert severity="error" className={styles.alert}>{error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} className={styles.countryGridCell}>
              <TextField
                fullWidth
                label={t('בחר מדינה', 'Select country')}
                value={countryQuery}
                onChange={(e)=> setCountryQuery(e.target.value)}
                placeholder={t('התחל להקליד כדי לסנן או להוסיף', 'Type to filter or add')}
                InputProps={{ startAdornment: <InputAdornment position="start"><Public /></InputAdornment> }}
                aria-autocomplete="list"
                aria-controls="countries-edit-list"
                role="combobox"
                onFocus={()=> setPanelOpen(true)}
                onBlur={()=> setTimeout(()=> setPanelOpen(false), 150)}
              />
              {panelOpen && (
                <Box id="countries-edit-list" role="listbox" aria-label="רשימת מדינות" className={styles.countriesPanel}>
                  {filteredCountries
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
              <Box className={styles.currencyRow}>
                <Button size="small" className={styles.currencyBtn} variant={currency==='ILS'?'contained':'outlined'} onClick={()=> setCurrency('ILS')}>₪ ILS</Button>
                <Button size="small" className={styles.currencyBtn} variant={currency==='USD'?'contained':'outlined'} onClick={()=> setCurrency('USD')}>$ USD</Button>
                <Button size="small" className={styles.currencyBtn} variant={currency==='EUR'?'contained':'outlined'} onClick={()=> setCurrency('EUR')}>€ EUR</Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="תיאור" name="vacation_description" value={form.vacation_description} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><Description /></InputAdornment> }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="תאריך התחלה" name="vacation_start" type="date" value={form.vacation_start} onChange={handleChange}
                InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Event /></InputAdornment> }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="תאריך סיום" name="vacation_ends" type="date" value={form.vacation_ends} onChange={handleChange}
                InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Event /></InputAdornment> }} required />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<ImageIcon />}>העלה תמונה (לא חובה)
                <input hidden type="file" name="file" accept="image/*" onChange={handleChange} />
              </Button>
              <Typography variant="caption" className={styles.fileName}>{form.file?.name}</Typography>
              <Box className={styles.imageRow}>
                <FormControlLabel control={<Checkbox checked={removeImage} onChange={(e)=> setRemoveImage(e.target.checked)} />} label={t('הסר תמונה קיימת', 'Remove existing image')} />
                {currentImage ? (
                  <Typography variant="caption" color="text.secondary">{t('תמונה נוכחית:', 'Current image:')} {String(currentImage).slice(0, 60)}</Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">{t('אין תמונה — תוצג תמונת דיפולט לפי האזור', 'No image — will show region default')}</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={submitting}>שמור</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}


