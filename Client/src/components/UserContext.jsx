import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [ user, setUserState ] = useState(null);
  const [ loading, setLoading ] = useState(true);

    // Load user from localStorage on first render
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
      setLoading(false);
    }, []);
  
    // Wrap setUser to also store in localStorage
    const setUser = (userData) => {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('user');
      }
      setUserState(userData);
    };  

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);