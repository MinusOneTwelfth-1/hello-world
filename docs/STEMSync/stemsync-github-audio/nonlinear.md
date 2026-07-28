fnSigma[x_] := 1/(1 + Exp[-k x])
fnForce[x_, a_] := (1 - fnSigma[x])*x + a fnSigma[x]*x*x
k = 3; a = 0.75
Plot[fnForce[x, a], {x, -5, 5}]


<img width="482" height="306" alt="plot" src="https://github.com/user-attachments/assets/1b727965-370f-4c30-bcf5-35957116d91d" />
