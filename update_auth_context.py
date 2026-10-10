import re

filepath = 'mobile/store/authContext.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_load_session = """    // Hydrate existing session from SecureStore
    const loadSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          Storage.getToken(),
          Storage.getUser(),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (err) {
        console.warn('Failed to restore session from SecureStore:', err);
      } finally {
        setIsLoading(false);
      }
    };"""

new_load_session = """    // Hydrate existing session from SecureStore and refresh from backend
    const loadSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          Storage.getToken(),
          Storage.getUser(),
        ]);

        if (storedToken && storedUser) {
          // Set initial cached state so app can open immediately
          setToken(storedToken);
          setUser(storedUser);
          
          // Fetch fresh user data from backend
          try {
             const { apiClient } = require('../services/api');
             const res = await apiClient.get('/auth/me');
             if (res.data && res.data.data) {
                setUser(res.data.data);
                await Storage.saveUser(res.data.data);
             }
          } catch (apiErr) {
             console.warn('Failed to fetch fresh user data from backend:', apiErr);
          }
        }
      } catch (err) {
        console.warn('Failed to restore session from SecureStore:', err);
      } finally {
        setIsLoading(false);
      }
    };"""

content = content.replace(old_load_session, new_load_session)

with open(filepath, 'w') as f:
    f.write(content)
