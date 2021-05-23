const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const users = {}
const peer = new Peer( undefined, {
    host: '/',
    port: '3001'
})

const vidioElement = document.createElement('video')
vidioElement.muted = true

navigator.mediaDevices.getUserMedia(
    {
      video: true,
      audio: true  
    }
).then( stream => {
    addVideoStream(vidioElement, stream)
    peer.on('call' , call =>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream =>{
            addVideoStream(video,userVideoStream)
        })
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

function addVideoStream( video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)

}


function connectToNewUser( userId, stream){
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close', ()=>{
        video.remove()
    })

    users[userId] = call
}

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected', userId =>{
   if(users[userId]) users[userId].close()
})

socket.on('user-connected', userId => {
    console.log('User is connected: ' + userId)
})