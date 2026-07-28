hosting stemsync on github (mostly). Except maybe lab html. Added audio to webrtc bundle. 


fnSigma[x_] := 1/(1 + Exp[-k x])

fnForce[x_, a_] := (1 - fnSigma[x])*x + a fnSigma[x] x x

k = 3; a = 0.75

Plot[fnForce[x, a], {x, -5, 5}]


plot


<img width="482" height="306" alt="plot" src="https://github.com/user-attachments/assets/3a5f38cb-e0a4-4e5b-bdb8-141598823e3f" />
