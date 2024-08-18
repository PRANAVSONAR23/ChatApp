import React, { useState } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext.jsx';
import { useContext } from 'react';

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
    const [isLoginorRegister, setisLoginorRegister] = useState('register');


    async function handleSubmit(e) {
        e.preventDefault();
        const url=isLoginorRegister==='register'?'register':'login'
        const { data } = await axios.post(url, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
        
    }

    return (
        <div className='bg-gray-200 h-screen flex justify-center items-center'>
        <div className='py-8 px-6 max-w-md bg-white bg-opacity-30 rounded-lg shadow-lg backdrop-blur-xl backdrop-filter w-full'>
            <form className='flex flex-col' onSubmit={handleSubmit}>
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-5"> {isLoginorRegister==='register'?'Register':'Login'}</h1>
              <div className='mb-5'>
                <label className="text-gray-700 font-semibold mb-2" >Username</label>
                <input type='text'  className='bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal'
                    value={username} onChange={(e) => setUsername(e.target.value)} />
              </div> 

              <div className='mb-5'>
                <label className="text-gray-700 font-semibold mb-2" >Password</label>
                <input type='password'  className='bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal'
                    value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>     
                <button className='bg-orange-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out mb-5'>
                    {isLoginorRegister==='register'?'Register':'Login'}
                </button>

                <div className='text-center mt-2 text-slate-700 font-semibold'>
                    {isLoginorRegister==='register'&& (
                        <div> 
                            Already a member?
                            <button className='ml-1  rounded-md p-1 shadow-md hover:shadow-lg transition duration-300 ease-in-out' onClick={()=>setisLoginorRegister('login')} >Login here</button>
                        </div>

                    )}
                    {isLoginorRegister==='login'&& (
                        <div> 
                            Dont have a account?
                            <button className='ml-1  rounded-md p-1 shadow-md hover:shadow-lg transition duration-300 ease-in-out' onClick={()=>setisLoginorRegister('register')} >Register</button>
                        </div>

                    )}
                </div>
            </form>
        </div>
        </div>
    );
};

export default Register;
