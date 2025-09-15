import React, { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, Alert, Grid, Button, Divider, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import styles from './AdminPanel.module.css';
import { UseUser } from '../../Contexts/UserContexts';
import { useNavigate } from 'react-router-dom';
import { useUi } from '../../Contexts/UiContext';
import { getVacations, deleteVacation, getUsers, updateUser, deleteUser, banUser, unbanUser, checkBan } from '../../api/api';

export function AdminPanel() {
  const { user, isAuthenticated, refreshUser } = UseUser();
  const { language } = useUi();
  const navigate = useNavigate();

  const [vacations, setVacations] = useState([]);
  const [users, setUsers] = useState([]);
  const [bans, setBans] = useState({}); // userId -> ban info
  const [error, setError] = useState('');

  const [banOpen, setBanOpen] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('7');
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [deleteVacationOpen, setDeleteVacationOpen] = useState(false);
  const [deleteVacationTarget, setDeleteVacationTarget] = useState(null);

  const t = (he, en) => (language === 'he' ? he : en);

  useEffect(() => {
    if (!isAuthenticated || user?.role_id !== 1) return;
    const load = async () => {
      try {
        const [v, u] = await Promise.all([getVacations(), getUsers()]);
        setVacations(Array.isArray(v) ? v : []);
        setUsers(Array.isArray(u) ? u : []);
        // Preload ban status
        const entries = await Promise.all((Array.isArray(u) ? u : []).map(async (usr) => {
          try { const info = await checkBan(usr.user_id); return [usr.user_id, info]; } catch { return [usr.user_id, { banned: false }]; }
        }));
        const map = {};
        entries.forEach(([id, info]) => { map[id] = info; });
        setBans(map);
      } catch (e) {
        setError(e.message || 'Failed to load admin data');
      }
    };
    load();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role_id !== 1) {
    return (
      <Container maxWidth="md">
        <Box className={styles.pageTop}>
          <Alert severity="error">
            {t('אין לך הרשאה לצפות בדף זה', 'You do not have permission to view this page.')}
          </Alert>
        </Box>
      </Container>
    );
  }

  const openDeleteVacationDialog = (vacation) => {
    setDeleteVacationTarget(vacation);
    setDeleteVacationOpen(true);
  };

  const handleDeleteVacation = async () => {
    if (!deleteVacationTarget) return;
    try {
      await deleteVacation(deleteVacationTarget.vacation_id, user?.user_id);
      setVacations(prev => prev.filter(v => Number(v.vacation_id) !== Number(deleteVacationTarget.vacation_id)));
      setDeleteVacationOpen(false);
      setDeleteVacationTarget(null);
    } catch (e) {
      setError(e.message || 'Failed to delete vacation');
      setDeleteVacationOpen(false);
      setDeleteVacationTarget(null);
    }
  };

  const handleToggleAdmin = async (u) => {
    const nextRole = Number(u.role_id) === 1 ? 2 : 1;
    try {
      await updateUser(u.user_id, { role_id: nextRole });
      setUsers(prev => prev.map(x => x.user_id === u.user_id ? { ...x, role_id: nextRole } : x));
      
      // If we're changing the role of the currently logged-in user, refresh their data
      if (user && Number(u.user_id) === Number(user.user_id)) {
        try {
          await refreshUser();
          // If admin was demoted to regular user, redirect away from admin panel
          if (nextRole !== 1) {
            navigate('/');
          }
        } catch (refreshError) {
          console.error('Failed to refresh current user data:', refreshError);
          // If refresh fails, logout for safety
          if (nextRole !== 1) {
            navigate('/');
          }
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to update user');
    }
  };

  const openDeleteDialog = (u) => {
    setDeleteTarget(u);
    setDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.user_id);
      setUsers(prev => prev.filter(x => x.user_id !== deleteTarget.user_id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      setError(e.message || 'Failed to delete user');
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const openBanDialog = (u) => {
    setBanTarget(u);
    setBanReason('');
    setBanDays('7');
    setBanOpen(true);
  };

  const submitBan = async () => {
    const days = parseInt(banDays, 10) || 0;
    if (!banTarget || days <= 0) { setBanOpen(false); return; }
    try {
      await banUser(banTarget.user_id, { reason: banReason, days });
      setBanOpen(false);
      const info = await checkBan(banTarget.user_id);
      setBans(prev => ({ ...prev, [banTarget.user_id]: info }));
    } catch (e) {
      setError(e.message || 'Failed to ban user');
      setBanOpen(false);
    }
  };

  const handleUnban = async (u) => {
    try {
      await unbanUser(u.user_id);
      setBans(prev => ({ ...prev, [u.user_id]: { banned: false, info: null } }));
    } catch (e) {
      setError(e.message || 'Failed to unban user');
    }
  }

  return (
    <Container maxWidth="lg">
      <Box className={styles.pageTop}>
{error && <Alert severity="error" style={{ marginBottom: '16px' }}>{error}</Alert>}
        <Grid container spacing={3} className={styles.adminGrid}>
          <Grid size={{ xs: 12, sm: 6 }} className={styles.adminVacations}>
            <Paper elevation={3} className={styles.cardPaper}>
              <Box className={styles.topBar}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  {t('ניהול חופשות', 'Vacations Management')} ({vacations.length})
                </Typography>
                <Button variant="contained" onClick={() => navigate('/vacations/add')}>
                  {t('הוסף חופשה', 'Add Vacation')}
                </Button>
              </Box>
              <Divider className={styles.divider} />
              <List>
                {vacations.map(v => (
                  <ListItem key={v.vacation_id} className={styles.rowItem}>
                    <ListItemText className={styles.colText} primary={v.country_name} secondary={`${v.vacation_start} - ${v.vacation_ends}`} />
                    <Box className={styles.cellActions}>
                      <Button className={styles.btnEdit} size="small" onClick={() => navigate(`/vacations/edit/${v.vacation_id}`)}>{t('ערוך', 'Edit')}</Button>
                      <Button className={styles.btnDelete} size="small" onClick={() => openDeleteVacationDialog(v)}>{t('מחק', 'Delete')}</Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} className={styles.adminUsers}>
            <Paper elevation={3} className={styles.cardPaper}>
              <Typography variant="h6" className={styles.sectionTitle}>
                {t('ניהול משתמשים', 'Users Management')} ({users.length})
              </Typography>
              <Divider className={styles.divider} />
              <List>
                {users.map(u => (
                  <ListItem key={u.user_id} className={styles.rowItem}>
                    <ListItemText className={styles.colText} primary={`${u.first_name} ${u.last_name}`} secondary={u.user_email} />
                    <Box className={styles.cellActions}>
                      <Button className={styles.btnEdit} size="small" onClick={() => handleToggleAdmin(u)}>
                        {Number(u.role_id) === 1 ? t('הסר מנהל', 'Revoke Admin') : t('הפוך למנהל', 'Make Admin')}
                      </Button>
                      {bans[u.user_id]?.banned ? (
                        <Button className={styles.btnEdit} size="small" onClick={() => handleUnban(u)}>
                          {t('בטל הרחקה', 'Unban')}
                        </Button>
                      ) : (
                        <Button className={styles.btnBan} size="small" onClick={() => openBanDialog(u)}>
                          {t('הרחק', 'Ban')}
                        </Button>
                      )}
                      <Button className={styles.btnDelete} size="small" onClick={() => openDeleteDialog(u)} disabled={u.user_id === user?.user_id}>
                        {t('מחק', 'Delete')}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={banOpen} onClose={() => setBanOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('הרחקת משתמש', 'Ban user')}</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('סיבה', 'Reason')}
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              fullWidth
            />
            <TextField
              label={t('מספר ימים', 'Days')}
              type="number"
              inputProps={{ min: 1 }}
              value={banDays}
              onChange={e => setBanDays(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanOpen(false)}>{t('בטל', 'Cancel')}</Button>
          <Button className="btn-ban" onClick={submitBan}>{t('הרחק', 'Ban')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('אישור מחיקת משתמש', 'Confirm User Deletion')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget && t(
              `האם אתה בטוח שברצונך למחוק את המשתמש ${deleteTarget.first_name} ${deleteTarget.last_name}?`,
              `Are you sure you want to delete user ${deleteTarget.first_name} ${deleteTarget.last_name}?`
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('פעולה זו לא ניתנת לביטול.', 'This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('בטל', 'Cancel')}</Button>
          <Button className="btn-delete" onClick={handleDeleteUser} variant="contained" color="error">
            {t('מחק משתמש', 'Delete User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Vacation Dialog */}
      <Dialog open={deleteVacationOpen} onClose={() => setDeleteVacationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('אישור מחיקת חופשה', 'Confirm Vacation Deletion')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteVacationTarget && t(
              `האם אתה בטוח שברצונך למחוק את החופשה ל${deleteVacationTarget.country_name}?`,
              `Are you sure you want to delete the vacation to ${deleteVacationTarget.country_name}?`
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('פעולה זו לא ניתנת לביטול.', 'This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVacationOpen(false)}>{t('בטל', 'Cancel')}</Button>
          <Button className="btn-delete" onClick={handleDeleteVacation} variant="contained" color="error">
            {t('מחק חופשה', 'Delete Vacation')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
