export default function Avatar({userId,username,online}) {
   const colors = [ 'bg-red-300','bg-indigo-500', 'bg-indigo-500','bg-gray-200',
                   'bg-green-200', 'bg-purple-300',
                   'bg-blue-300', 'bg-yellow-200',
                   'bg-orange-200', 'bg-pink-300', 'bg-fuchsia-400', 'bg-rose-300'];
   const userIdBase10 = parseInt(userId.substring(10), 16);
   const colorIndex = userIdBase10 % colors.length;
   const color = colors[colorIndex];
   return (
     <div className={"w-10 h-10 relative rounded-full flex items-center "+color}>
       <div className="text-center w-full opacity-70">{username[0]}</div>
       {online && (
         <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
       )}
       {!online && (
         <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
       )}
     </div>
   );
 }