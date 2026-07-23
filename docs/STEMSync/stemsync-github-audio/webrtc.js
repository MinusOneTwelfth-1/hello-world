console.log('webrtc.js')

// ===== STATE =====
  let zzz=null;
  let peerConnection = null;
  let dataChannel = null;
  let isInitiator = false;
  let myId = Math.random().toString(36).substr(2, 6);
  let lastTimestamp = 0;
  let pollTimer = null;
  let hostOffer=null;
  let hostCandidates=[];
  let guestCandidates=[];
  let offerFromHost=null;
  let answerFromGuest=null;

// ===== WEBRTC: Create PeerConnection =====
  async function createPeerConnection(initiator) {
    tolog('createPeerConnection()...')
    isInitiator = initiator;
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    peerConnection = new RTCPeerConnection(config);
  
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      tolog('onicecandidate() fired')
      console.log('onIceCandidate')
      if (event.candidate !== null && event.candidate.candidate !== "") {
         tolog('ice candidate rcvd...\n'+event.candidate.candidate.substring(0,75))
        statusDiv.textContent = 'ICE candidate recvd...';
        if(initiator)
        {hostCandidates.push(event.candidate.candidate)}
         else
         {guestCandidates.push(event.candidate.candidate);}
         
      }
      else
          { tolog('no more candidates')
            console.log('all candidates in... '); 
            if(initiator){  // putHostCandidates(hostCandidates)
                            putHostOffer()   
                         } 
              else { // putGuestCandidates(guestCandidates)
                     putAnswer()
                    }   }
    };

   // Connection state change
    peerConnection.onconnectionstatechange = async () => {
      console.log('Connection state:', peerConnection.connectionState);
      statusDiv.textContent = `🔗 Connection state: ${peerConnection.connectionState}`;
      
      if (peerConnection.connectionState === 'connected') {
        isConnected = true;
        appendMessage('✅ WebRTC connected!', 'System');
        sendBtn.disabled = false;
        statusDiv.textContent = '✅ Connected! You can now send messages.';
        // Stop polling – no longer needed
       
       

      } 
      
      else if (peerConnection.connectionState === 'failed') {
        statusDiv.textContent = '❌ Connection failed. Try refreshing both pages.';
        appendMessage('❌ Connection failed', 'System');
      } else if (peerConnection.connectionState === 'disconnected') {
        statusDiv.textContent = '⚠️ Disconnected';
      }
    };

     console.log("🎙️ Requesting microphone access...");

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              

   
            // Add local audio tracks to the connection
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));


 if (initiator) {

         
      // Create data channel
      console.log("creating data channel")
      dataChannel = peerConnection.createDataChannel('chat');
      setupDataChannel(dataChannel);
      statusDiv.textContent = '📤 Creating offer...';
      // Create offer
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
         // statusDiv.textContent = '📤 Sending offer...';
         // hostOffer=peerConnection.localDescription.sdp
         // putHostOffer(hostOffer)
        })
        .catch(err => console.error('Error creating offer:', err));
    } else {
      // Joiner: listen for data channel
      peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
      };
    }




peerConnection.ontrack = (event) => {
  console.log("======= peerConnection.ontrack() ======")
    // Grab the first stream from the event
    const [remoteStream] = event.streams; 
    
    // Assign the stream to the audio element
    listener.srcObject = remoteStream;
};


 


    return peerConnection;



} // end of createPeerConnection()


async function processOffer(offer){
    tolog('processOffer(offer) called')
    
    offerFromHost=offer
    peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerFromHost }))
       .then(() => { tolog('setRemoteDesctiption has resolved.' )
                     return peerConnection.createAnswer()
                    })
       .then((answer) => {tolog('createAnswer has resolved')
                          console.log('createAnswer has resolved')
                          console.log(answer)
                          
                           tolog('answer: '+(JSON.stringify(answer)).substring(0,75));
                           prom=peerConnection.setLocalDescription(answer); 
                           return prom
                          }
            )
       .then( ()=>{tolog('setLocalDescription has resolved')
                  console.log("setLocalDescription has resolved");
                  
            //      putAnswer()
            
                   }
            )
       
    
         }

 async function acceptGuestAnswer(ans){
          tolog('answer from ' + ans.guestID)
          
                   remot=new RTCSessionDescription({type: "answer", sdp: ans})
                   peerConnection.setRemoteDescription(remot)                  
                  .then( (e)=>{ tolog('setRemoteDesc has resolved... ');  tolog(e)      }            )
                  .catch(err => tolog('@@@@ setRemoteDescription(ans) ERROR '+err)  );

}

function accepT(a){tolog('=====  accepT() hosts offer')
                   ansJ=JSON.parse(a);
                   tolog('answer from userID: '+ansJ.guestID) 
                   window.remoteSD=null
                   remot=new RTCSessionDescription(ansJ)
                   peerConnection.setRemoteDescription(remot)
                   .then( ()=>{
                          tolog('accepT() has set remoteDesctiption..\n' +
                          peerConnection.remoteDescription.sdp.substring(0,75))
                              }
                        )
                              }
                       


initiateBtn.textContent=initiateBtn.textContent+'*'
setButtons()
tolog('loaded webrtc.js OK')
console.log('end of jcell : webrtc')

//# sourceURL=praveen.com/webrtc.js