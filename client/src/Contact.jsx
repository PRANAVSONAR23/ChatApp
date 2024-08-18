import Avatar from "./Avatar.jsx";

export default function Contact({id,username,onClick,selected,online}) {
  return (
    <div key={id} onClick={() => onClick(id)}
         className={"border-b   flex items-center gap-2 cursor-pointer rounded-sm    "+(selected ? 'bg-gray-200' : 'bg-white')}>
      {selected && (
        <div className="w-1 bg-orange-600 h-14 rounded-r-md"></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center ">
        <Avatar online={online} username={username} userId={id} />
        <span className="text-black   text-lg font-semibold ">{username}</span>
      </div>
    </div>
  );
}