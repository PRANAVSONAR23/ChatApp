
import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const UserContext=createContext({});;

export function UserContextProvider({children }){

    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    
    useEffect(()=>{
        axios.get('/profile')
          .then(response=>{
            setUsername(response.data.username);
            setId(response.data.userId);
          })
          .catch(err => {
            console.error('Error fetching profile:', err);
          });
     },[]);
     

    return(
        <UserContext.Provider value={{username,setUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    )
}