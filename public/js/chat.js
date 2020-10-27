const socket = io()
let messages =document.querySelector('.message_area')
let name ="Prerna"


socket.on("notifyStopTyping",()=>{
    typing.innerText ="";
});