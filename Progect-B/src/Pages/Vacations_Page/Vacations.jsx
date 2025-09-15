import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Paper,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Favorite, FavoriteBorder, CalendarToday } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import styles from './Vacations.module.css';
import { useUi } from '../../Contexts/UiContext';
import { getVacations, likeVacation, unlikeVacation, deleteVacation } from '../../api/api';
import { useNavigate } from 'react-router-dom';

export function Vacations() {
  const navigate = useNavigate();
  const { language, currency } = useUi();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [vacations, setVacations] = React.useState([]);
  const [likesByVacationId, setLikesByVacationId] = React.useState({});
  const [likedByUser, setLikedByUser] = React.useState(new Set());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
  const [filenameCounts, setFilenameCounts] = React.useState({});

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const vacationsResp = await getVacations();

      const sorted = Array.isArray(vacationsResp)
        ? [...vacationsResp].sort((a, b) => new Date(a.vacation_start_date) - new Date(b.vacation_start_date))
        : [];
      setVacations(sorted);
      
      // Initialize likes count from vacation data
      const likesCountMap = {};
      for (const vacation of sorted) {
        likesCountMap[vacation.id] = vacation.vacation_followers_count || 0;
      }
      setLikesByVacationId(likesCountMap);
    } catch (e) {
      setError(e.message || 'Failed to load vacations');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLikeToggle = async (vacationId) => {
    const currentlyLiked = likedByUser.has(vacationId);
    setLikedByUser((prev) => {
      const copy = new Set(prev);
      if (currentlyLiked) copy.delete(vacationId); else copy.add(vacationId);
      return copy;
    });
    setLikesByVacationId((prev) => ({
      ...prev,
      [vacationId]: (prev[vacationId] || 0) + (currentlyLiked ? -1 : 1),
    }));

    try {
      if (currentlyLiked) {
        await unlikeVacation({ user_id: 1, vacation_id: vacationId });
      } else {
        await likeVacation({ user_id: 1, vacation_id: vacationId });
      }
    } catch (e) {
      setLikedByUser((prev) => {
        const copy = new Set(prev);
        if (currentlyLiked) copy.add(vacationId); else copy.delete(vacationId);
        return copy;
      });
      setLikesByVacationId((prev) => ({
        ...prev,
        [vacationId]: (prev[vacationId] || 0) + (currentlyLiked ? 1 : -1),
      }));
      setError(e.message || 'Failed to update like');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteVacation(confirmDeleteId);
      setVacations((prev) => prev.filter((v) => Number(v.id) !== Number(confirmDeleteId)));
      setLikesByVacationId((prev) => {
        const copy = { ...prev };
        delete copy[confirmDeleteId];
        return copy;
      });
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e.message || 'Failed to delete vacation');
    }
  };

  const formatDate = (value) => {
    try {
      const d = new Date(value);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    } catch {
      return value;
    }
  };
  const t = (he, en) => (language === 'he' ? he : en);
  const countryDefaultMap = {
    israel: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=1600&auto=format&fit=crop',
    greece: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1600&auto=format&fit=crop',
    italy: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?q=80&w=1600&auto=format&fit=crop',
    rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1600&auto=format&fit=crop',
    rhodes: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1600&auto=format&fit=crop',
    lahaina: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?q=80&w=1600&auto=format&fit=crop',
    corfu: 'https://images.unsplash.com/photo-1628752068394-37be53ce38af?q=80&w=1600&auto=format&fit=crop',
    hilo: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1600&auto=format&fit=crop',
    'montego bay': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop',
    spain: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1600&auto=format&fit=crop',
    france: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1600&auto=format&fit=crop',
    turkey: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=1600&auto=format&fit=crop',
    cyprus: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?q=80&w=1600&auto=format&fit=crop',
    'united kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop',
    london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop',
    paris: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1600&auto=format&fit=crop',
    barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1600&auto=format&fit=crop',
    thailand: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop',
    japan: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1600&auto=format&fit=crop',
    switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1600&auto=format&fit=crop',
    netherlands: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1600&auto=format&fit=crop',
    germany: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1600&auto=format&fit=crop',
    portugal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1600&auto=format&fit=crop',
    dubai: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1600&auto=format&fit=crop',
    egypt: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1600&auto=format&fit=crop',
    morocco: 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d0?q=80&w=1600&auto=format&fit=crop',
    bali: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop',
    maldives: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1600&auto=format&fit=crop',
    mexico: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1600&auto=format&fit=crop',
    canada: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1600&auto=format&fit=crop',
    australia: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop',
    'new zealand': 'https://images.unsplash.com/photo-1469521669194-babb45599def?q=80&w=1600&auto=format&fit=crop',
    austria: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1600&auto=format&fit=crop',
    norway: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1600&auto=format&fit=crop',
    iceland: 'https://images.unsplash.com/photo-1539066033332-e2286ff4aa99?q=80&w=1600&auto=format&fit=crop',
    santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop',
    prague: 'https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=1600&auto=format&fit=crop',
    vienna: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1600&auto=format&fit=crop',
    usa: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1600&auto=format&fit=crop',
    'united states': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1600&auto=format&fit=crop',
    'united states of america': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1600&auto=format&fit=crop',
    brazil: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1600&auto=format&fit=crop',
    'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1600&auto=format&fit=crop',

  };
  // Normalize and map synonyms/cities to country keys
  const normalizeName = (str) => String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\u0590-\u05FF\s]/g, '')
    .trim();

  const synonymGroups = [
    { key: 'italy', list: ['italy','rome','venice','florence','milan','naples','sicily'] },
    { key: 'greece', list: ['greece','santorini','athens','rhodes','crete','mykonos'] },
    { key: 'israel', list: ['israel','tel aviv','jerusalem','eilat','haifa','dead sea'] },
    { key: 'france', list: ['france','paris','nice','lyon','bordeaux','cote d azur'] },
    { key: 'spain', list: ['spain','barcelona','madrid','valencia','seville','ibiza'] },
    { key: 'turkey', list: ['turkey','istanbul','antalya','bodrum','izmir'] },
    { key: 'cyprus', list: ['cyprus','paphos','limassol','larnaca'] },
    { key: 'usa', list: ['usa','united states','united states of america','new york','los angeles','san francisco','miami','las vegas','hawaii'] },
    { key: 'japan', list: ['japan','tokyo','kyoto','osaka','mount fuji','fuji','יפן','טוקיו','קיוטו','אוסקה','פוג׳י','הר פוג׳י'] },
    { key: 'thailand', list: ['thailand','bangkok','phuket','koh samui','chiang mai','krabi','תאילנד','בנגקוק','פוקט','קוסמוי','צ׳יאנג מאי','קראבי'] },
    { key: 'brazil', list: ['brazil','rio de janeiro','sao paulo','ברזיל','ריו דה זנרו','ריו דה ז׳נרו','סאו פאולו'] },
    { key: 'switzerland', list: ['switzerland','zermatt','interlaken'] },
    { key: 'netherlands', list: ['netherlands','amsterdam'] },
    { key: 'germany', list: ['germany','berlin','munich'] },
    { key: 'austria', list: ['austria','vienna','salzburg'] },
    { key: 'mexico', list: ['mexico','cancun','tulum'] },
    { key: 'portugal', list: ['portugal','lisbon','porto','algarve'] },
    { key: 'egypt', list: ['egypt','cairo','luxor','aswan'] },
    { key: 'morocco', list: ['morocco','marrakesh','chefchaouen','fes'] },
    { key: 'new zealand', list: ['new zealand','queenstown'] },
    { key: 'norway', list: ['norway','lofoten','bergen'] },
    { key: 'iceland', list: ['iceland','reykjavik','vik'] },
  ];
  const getCountryDefault = (countryName) => {
    if (!countryName) return placeholderImg;
    const norm = normalizeName(countryName);
    // direct match
    if (countryDefaultMap[norm]) return countryDefaultMap[norm];
    // synonyms
    for (const group of synonymGroups) {
      if (group.list.some((word) => norm === normalizeName(word) || norm.includes(normalizeName(word)))) {
        return countryDefaultMap[group.key] || placeholderImg;
      }
    }
    return placeholderImg;
  };
  const getImageSrc = (vacation) => {
    // Prefer an uploaded local file if present for this specific vacation
    const name = (vacation?.vacation_file_name || '').trim();
    if (name && !/^https?:\/\//i.test(name)) {
      return `http://localhost:5000/uploads/${name}`;
    }
    // Otherwise, fall back to a curated location image
    return getCountryDefault(vacation?.country_name);
  };

  const placeholderImg = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60`;

  return (
    <Container maxWidth="lg">
      <Box className={styles.headerBar}>
        <Typography variant="h4" component="h1">{t('חופשות', 'Vacations')}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : vacations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>{t('אין חופשות זמינות כרגע', 'No vacations available')}</Typography>
        </Paper>
      ) : (
        <Box role="list" className={styles.grid}>
          {vacations.map((vacation) => {
            const vacationId = Number(vacation.id);
            const likesCount = likesByVacationId[vacationId] || 0;
            const isLiked = likedByUser.has(vacationId);
            const canLike = true; // Allow everyone to like

            const start = vacation.vacation_start_date;
            const end = vacation.vacation_end_date;

            return (
              <Box key={vacationId} role="listitem" className={styles.listItem}>
                <Card className={styles.card}>
                  <Box className={styles.mediaWrap}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={vacation.vacation_image || placeholderImg}
                      alt={vacation.vacation_description}
                      onError={(e)=>{ e.currentTarget.src = placeholderImg; }}
                      className={styles.mediaImg}
                    />
                    {/* gradient overlay */}
                    <Box className={`${styles.topGradient} ${isDark ? styles.topGradientDark : styles.topGradientLight}`} />
                    {/* top overlays */}
                    <Button
                      aria-label={t('לייק', 'Like')}
                      size="small"
                      onClick={() => handleLikeToggle(vacationId)}
                      className={`${styles.likeBtn} ${isDark ? styles.likeBtnDark : styles.likeBtnLight}`}
                    >
                      {isLiked ? t('❤ Like', '❤ Like') : t('♡ Like', '♡ Like')} {likesCount ? likesCount : ''}
                    </Button>
                    {/* title overlay */}
                    <Typography variant="h5" className={styles.titleOverlay}>
                      {vacation.vacation_destination}
                    </Typography>
                  </Box>

                  {/* date bar */}
                  <Box className={`${styles.dateBar} ${isDark ? styles.dateBarDark : styles.dateBarLight}`}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>{`${formatDate(start)} - ${formatDate(end)}`}</Typography>
                  </Box>

                  <CardContent className={styles.cardContent}>
                    <Typography variant="body2" color="text.secondary" className={styles.descClamp}>
                      {vacation.vacation_description}
                    </Typography>
                    <Button 
                      aria-label={t('מחיר חופשה', 'Vacation price')} 
                      variant="contained" 
                      fullWidth 
                      sx={{ fontWeight: 'bold' }}
                      onClick={() => navigate('/no-money')}
                    >
                      ${Number(vacation.vacation_price).toLocaleString(language === 'he' ? 'he-IL' : 'en-US')}
                    </Button>
                  </CardContent>

                  <CardActions className={styles.actionsRow}>
                    <Tooltip title={isLiked ? t('בטל לייק', 'Unlike') : t('לייק', 'Like')}>
                      <span>
                        <IconButton
                          color={isLiked ? 'error' : 'default'}
                          onClick={() => handleLikeToggle(vacationId)}
                          aria-label="like"
                        >
                          {isLiked ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.primary', fontWeight: 600 }}>
                      {likesCount} {t('לייקים', 'likes')}
                    </Typography>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

    </Container>
  );
}
