console.log('jcell: signaling')

function putHostOffer(){
console.log('saving host offer...')
tolog('putHostOffer()...')
ofr=peerConnection.localDescription.sdp
google.script.run
.withSuccessHandler((e)=>
                        {tolog('google::saveHostOffer said: '+e)
                          hostStars()
                        }
                   )
.withFailureHandler(
                    (e)=>{ tolog('@@@ saveHostOffer::Error : '+e)               }
                   )
.saveHostOffer(ofr)
}

function putHostCandidates(cands){
tolog('DON"T putHostCandidates()...')
return
console.log('saving host candidates...')
google.script.run
.withSuccessHandler( (e)=>{tolog('google puHostCandidates said: '+e)
                           hostStars()
                          }
                   )
.withFailureHandler(
                      (e) => { tolog('putHostCandidates::Error : ' + e)           }
                   )
.saveHostCandidates(JSON.stringify(cands))
}

function getGuestAnswerAndProcessIt(){
          console.log('getGuestAnswerAndProcessIt()..')
          tolog('getGuestAnswerAndProcessIt()..')
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

                            }
function clearSignals(){
console.log('clearing signals')
google.script.run.withSuccessHandler(clearedSignalsOK).clearSignals()
}

function clearedSignalsOK(){
console.log('signals cleared ok')
}

 function getHostOfferAndProcessIt(){
 let promis;
 console.log('===== getHostOfferAndProcessIt() =====')
 tolog('calling google :: getHostOffer..')
 google.script.run.withSuccessHandler((e)=>
  { answerFromGuest=e
    tolog('google replied with offer' + e.substring(1,100)+'...')
   console.log('host offer: ' + e.substring(0,50)+'...');
 
   console.log( processOffer(e));
 
   }
 )
 .getHostOffer()
 
 
 }

function putAnswer(){
 tolog('putAnswer()...')
 console.log('==== putAnswer() ====')
 let id=document.querySelector("#guestID").value
 let desc=peerConnection.localDescription.toJSON()
 desc.guestID=id 
 google.script.run.withSuccessHandler(e=>{console.log(e);tolog('google..saveGuestAnswer said:' + e)})
 .saveGuestAnswer(JSON.stringify(desc))
}

function putGuestCandidates(cands){
tolog('DON"T putGeuestCandidates()...')
return
tolog('candidates: '+ (JSON.stringify(cands)).substring(0,75)+' ... ')
console.log('putting following guest candidates to sheet..')
console.log(cands)
google.script.run.withSuccessHandler( (x) => {console.log(x); 
                                              tolog('google::saveGuestCandidates said: '+x)
                                              } )
.saveGuestCandidates(JSON.stringify(cands))
}

initiateBtn.textContent=initiateBtn.textContent+'*'
setButtons()
tolog('loaded signaling.js OK')
console.log('end of jcell -- signaling.js')

//# sourceURL=praveen.com/signaling.js