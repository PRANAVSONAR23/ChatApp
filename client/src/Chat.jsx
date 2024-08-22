import {useContext, useEffect, useRef, useState} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from "./UserContext.jsx";
import {uniqBy} from "lodash";
import axios from "axios";
import Contact from "./Contact";

export default function Chat() {
  const [ws,setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState({});
  const [offlinePeople,setOfflinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [newMessageText,setNewMessageText] = useState('');
  const [messages,setMessages] = useState([]);
  const {username,id,setId,setUsername} = useContext(UserContext);
  const divUnderMessages = useRef();
  const [search, setSearch] = useState("");



  


useEffect(() => {
  if (selectedUserId) {
    const connectToWs = () => {
      const socket = new WebSocket('ws://https://chatapp-l18d.onrender.com');

      

      const handleClose = () => {
        console.log('Disconnected. Trying to reconnect.');
        setTimeout(connectToWs, 1000);
      };

      socket.addEventListener('message', handleMessage);
      socket.addEventListener('close', handleClose);
     

      setWs(socket);

      // Cleanup function to remove event listeners
      return () => {
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('close', handleClose);
        socket.close();
      };
    };

    const cleanup = connectToWs();

    return cleanup;
  }
}, [selectedUserId]);





///--------------------------------------------------

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }


  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    console.log({ev,messageData});
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => ([...prev, {...messageData}]));
        
      }
    }
  }
  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }
  async function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    await ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      setTimeout(() => {
        axios.get("/messages/" + selectedUserId).then((res) => {
          setMessages(res.data);
          
        }); 
      }, 500);
    } else {
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }

  function sendFile(ev) {
    const reader = new FileReader();
    
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        data: reader.result,
        name: ev.target.files[0].name,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({behavior:'smooth',block:'end'});
    }
  }, [messages]); 

  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = Array.isArray(res.data) ?res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id)):[];
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/'+selectedUserId).then(res => {
        setMessages(res.data);
      });
    }

  }, [selectedUserId]);

  

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, '_id');

  const selectedUserName = selectedUserId
    ? onlinePeople[selectedUserId] || offlinePeople[selectedUserId]?.username
    : '';


    const filteredOnlinePeople = Object.entries(onlinePeopleExclOurUser)
    .filter(([userId, username]) => username.toLowerCase().includes(search.toLowerCase()))
    .map(([userId, username]) => ({ userId, username }));
  
  const filteredOfflinePeople = Object.entries(offlinePeople)
    .filter(([userId, person]) => person.username.toLowerCase().includes(search.toLowerCase()))
    .map(([userId, person]) => ({ userId, username: person.username }));
  
    
    
    


  return (
    <div className="flex h-screen  bg-white  ">
      <div className="bg-white w-1/3 flex flex-col rounded-lg">
        <div className="flex-grow">
          
          
          <div className="text-center  p-4 ">
            <input type="search" placeholder="search" value={search} className=" w-full p-3 border border-gray-500 rounded-md bg-gray-100"
            onChange={(e)=>setSearch(e.target.value)}
            />
          </div>
          {filteredOnlinePeople.map(it => (
            <Contact
              key={it.userId}
              id={it.userId}
              online={true}
              username={it.username}
              onClick={() => {setSelectedUserId(it.userId);console.log({})}}
              selected={it.userId === selectedUserId} />
          ))}
          {filteredOfflinePeople.map(it => (
            <Contact
              key={it.userId}
              id={it.userId}
              online={false}
              username={it.username}
              onClick={() => setSelectedUserId(it.userId)}
              selected={it.userId === selectedUserId} />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center gap-2 bg-white border-t-2">
          <span className="mr-2 text-lg text-black flex items-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-lg   bg-white py-1 px-2 text-black border rounded-xl">Logout</button>
        </div>
      </div>

      {/* chats */}
      <div className="flex flex-col bg-white w-2/3 p-2 " >
      
        <div className="flex-grow ">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-black">&larr; Select a person from the sidebar</div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full ">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 scrollbar-hide">
                <div className="bg-gray-100 h-16 flex fixed w-full p-1 gap-1 ">
                  <Avatar online={true} username={selectedUserName} userId={selectedUserId} />
                  <div className="flex flex-col "> 
                   <div className="font-semibold text-xl ">{selectedUserName}</div>
                  <div>typing</div>
                  </div>
                </div>
                {messagesWithoutDupes.map(message => (
                  <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                    <div className={"text-left inline-block p-2 my-2 rounded-md text-lg max-w-2xl " +(message.sender === id ? 'bg-orange-500 text-white':'bg-gray-100 text-gray-800')}>
                      {message.text}
                      {message.file && (
                        <div className="">
                          <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                            {<img src={axios.defaults.baseURL + '/uploads/' + message.file}  ></img>}  
                            
                            {message.file}
                          </a>
                          
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input type="text"
                   value={newMessageText}
                   onChange={ev => setNewMessageText(ev.target.value)}
                   placeholder="Type your message here"
                   className="bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal text-black"/>
            <label className="bg-white p-2  cursor-pointer rounded-xl border  text-orange-500">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label>
            <button type="submit" className=" p-2  bg-gray-200 text-orange-500 font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

//bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out mb-5