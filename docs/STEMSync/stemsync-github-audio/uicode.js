console.log('uicode.js')



async function startAndWait(){
console.log("startAndWait() called")

url = googleScriptURL + "?clearsignals=true"

await fetch(url,{method:"GET", redirect: "follow"})

joinBtn.textContent='.'

createPeerConnection(role=="Host")
}


function joinMeeting(){
if(role=='Host'){ getGuestAnswerAndProcessIt()}
else
  {
    tolog('creacreatePeerConnection(false)')
    createPeerConnection(false)
    tolog('getHostOfferAndProcessIt()')
    getHostOfferAndProcessIt()
  }
}

function tolog(s){
logbox.value=logbox.value+'\n..........................\n'+s
}

function hostStars(){
 joinBtn.textContent=joinBtn.textContent.trim()+'*'
 if(joinBtn.textContent=='.*'){
                  joinBtn.textContent='Admit'
                  joinBtn.disabled=false       
                  
                             }

}

  sendBtn.addEventListener('click', () => {
    const text = msgInput.value.trim();
    if (!text || !dataChannel || dataChannel.readyState !== 'open') {
      statusDiv.textContent = '⚠️ Cannot send: channel not ready';
      return;
    }
    dataChannel.send(text);
    appendMessage(text, 'Me');
    msgInput.value = '';
    statusDiv.textContent = '✅ Message sent';
  });

  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

initiateBtn.textContent=initiateBtn.textContent+'*'
setButtons()
console.log('end of jcell uicode')
tolog('loaded uicode.js OK')

//# sourceURL=praveen.com/uicode.js