console.log('jcell: signaling')

async function doPost(postData,query) {
  const url = googleScriptURL + query; // params e.g. "?puthostoffer=true"
  
 

  // Fire and forget
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors', // Bypasses all CORS security checks
    headers: {
      'Content-Type': 'application/json' // Now you can safely use standard JSON headers
    },
    body: postData
  });
  
  console.log('Request sent! (Response is ignored)');
}

function putHostOffer(){
console.log('saving host offer...');

ofr=peerConnection.localDescription.sdp

doPost(ofr,"?puthostoffer=true")

                        hostStars();
                
                        }


function getGuestAnswerAndProcessIt(){
          console.log('getGuestAnswerAndProcessIt()..');
         // tolog('getGuestAnswerAndProcessIt()..');
          /*
          google.script.run
         .withSuccessHandler(
               (e)=>{ tolog('google::getGuestAnswer said '+ e.substring(0,75)) 
                      answerFromGuest = e
                      accepT(e)
                     }
                            )
          .withFailureHandler(
                (e)=>{ tolog('@@@ FAIL - google::getGuestAnswer said '+e ) }
                             )
          .getGuestAnswer() 

          */
      (

         async () => {
          url=googleScriptURL + "?getguestanswer=true"
          const response = await fetch(url,{method: "GET", redirect: "follow"})
          const sdp = await response.text();
          console.log(sdp.slice(150))
          console.log(acceptGuestAnswer(sdp))
         }

      )()

                            }
function clearSignals(){
console.log('clearing signals')
google.script.run.withSuccessHandler(clearedSignalsOK).clearSignals()
}



 function getHostOfferAndProcessIt(){
 let promis;
 console.log('===== getHostOfferAndProcessIt() =====');
 

(
async () => {
url= googleScriptURL + "?gethostoffer=true"  
const response = await fetch(url,{method: "GET", redirect: "follow"});

const sdp = await response.text(); // Works perfectly! Stream consumed.
console.log(sdp.slice(150))
console.log('host offer: ' + sdp.substring(0,50)+'...');
 console.log( processOffer(sdp));
 
}
) ()
  
 }


function putAnswer(){
 tolog('putAnswer()...')
 console.log('==== putAnswer() ====')
 let id=document.querySelector("#guestID").value
 let desc=peerConnection.localDescription.sdp;


 doPost(desc, "?putguestanswer=true");
 
(
async () => {
const response = await fetch(url,{method: "GET", redirect: "follow"});

const sdp = await response.text(); // Works perfectly! Stream consumed.
console.log(sdp.slice(150))
console.log('host offer: ' + sdp.substring(0,50)+'...');
 
 
}
) ()

}



initiateBtn.textContent=initiateBtn.textContent+'*'
setButtons()
tolog('loaded signaling.js OK')
console.log('end of jcell -- signaling.js')

//# sourceURL=praveen.com/signaling.js