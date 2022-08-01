	var sim
	var chain
	var canvas=document.getElementById("scratch");
	var ctx	=canvas.getContext("2d")
	var simNumber=0
	
	var grav=1e-20
	var dGrav = 0.001
	var newGrav=0.55
	var moreGrav = newGrav - grav
	
	var angleConstraints=[]
	var lasT
	var segz=[]
	
	var pin0A
	var pin0B
	var pin1A
	var pin1B
	
	var doneHandle=false
	
	var nsteps = 24
	var archHeight = 600
	
	var broken = false
	var doFracture = false
	var maxBend=0

	window.onload = function() {
		

		// canvas dimensions
		var width = parseInt(canvas.style.width);
		var height = parseInt(canvas.style.height);

		// retina
		var dpr = window.devicePixelRatio || 1;
		canvas.width = width*dpr;
		canvas.height = height*dpr;
		canvas.getContext("2d").scale(dpr, dpr);

		// simulation
		sim = new VerletJS(width, height, canvas);
		sim.friction = 0.97;
		sim.gravity.y=grav
		
		// entities
		var X1=width*0.3; X2=width*0.7; Y1=height/2

		Xstep = (X2-X1)/nsteps
		Ystep=archHeight/nsteps
		
				
	
		var sup1A=new Vec2(X1-20,Y1); sup1A.ID='sup1A'
		var sup1B=new Vec2(X1,Y1); sup1B.ID='sup1B'
		segz.push(sup1A)
		segz.push(sup1B)
		
		for (i=1; i<=nsteps/2; i++){
								segz.push(new Vec2(X1+ i * Xstep, Y1 - i * Ystep))
								
			                }

		xa = segz[segz.length-1].x; ya=segz[segz.length-1].y
		for (i=1; i<=nsteps/2; i++){
								segz.push(lasT=new Vec2(xa + i * Xstep, ya + i * Ystep))
							}
		
		
	
		
		segz.push(new Vec2(lasT.x+15, lasT.y))
	
		console.log(segz)
		
		
		chain = sim.lineSegments(segz, 5)
		
		for (p in chain.particles)
			{
				chain.particles[p].lastPos = chain.particles[p].pos
			}
		
		
		pin0A = chain.pin(0); pin0A.ID='pin0A'
		pin0B = chain.pin(1); pin0B.ID='pin0B'
	
		pin1A = chain.pin(segz.length-1)
		pin1A.ID='pin1B'
		pin1B = chain.pin(segz.length-2)
		pin1B.ID='pin1B'
		
		
		
		angleConstraints=[]
		for (i=0; i<chain.particles.length - 2; i++)
			{
			  nucon=new AngleConstraint('aa', chain.particles[i], 
														chain.particles[i+1], chain.particles[i+2],
														0.1,0)
			  nucon.ID= '' + i + '_' + i+1 + '_' + i+2
			  angleConstraints.push(nucon)
			 chain.constraints.push(nucon)
			}
		
	
		var linWid = 2.5
		
		chain.drawConstraints=function(ctx, compo)
		{
			ctx.save();
			ctx.strokeStyle = "#543324";
			ctx.lineCap = "round";
			
			for(i=0; i<compo.constraints.length; i++)
				{   var con=compo.constraints[i]
					if (!(con instanceof DistanceConstraint ))
					continue;
					
					ctx.beginPath();
					ctx.moveTo(con.a.pos.x, con.a.pos.y);
					ctx.lineTo(con.b.pos.x, con.b.pos.y);
					ctx.lineWidth = linWid;
					ctx.stroke();
				}	
		
			
			ctx.restore();	
		}
		
		chain.drawParticles=function(ctx,compo)
		{	ctx.save();
			ctx.strokeStyle = "Black";
			ctx.fillStyle = "#eb5e34"
			ctx.lineWidth=1
			
			for(i=2; i<compo.particles.length-2; i++)
				{	var cx = compo.particles[i].pos.x
					var cy = compo.particles[i].pos.y
					ctx.beginPath()
					ctx.arc(cx, cy,3.6,0,2*Math.PI)
					ctx.fill()
					ctx.stroke()
				}
				

			cx=chain.particles[0].pos.x; cy = chain.particles[0].pos.y
			ctx.moveTo(cx,cy)
			ctx.beginPath()
			ctx.fillStyle="Yellow"
			ctx.strokeStyle = "Blue"
			ctx.lineWidth = 5			
			ctx.arc(cx,cy,6,0,2*Math.PI)
			ctx.stroke()
			ctx.fill()
			

			cx=chain.particles[chain.particles.length-1].pos.x; cy = chain.particles[chain.particles.length-1].pos.y
			ctx.moveTo(cx,cy)
			ctx.beginPath()
			ctx.strokeStyle = "Blue"
			ctx.lineWidth = 5			
			ctx.arc(cx,cy,6,0,2*Math.PI)
			ctx.fillStyle="Yellow"
			
			ctx.stroke()	
			ctx.fill()		
			
			ctx.restore()
			
			
		}
		
		freeze($("#txtRigidity").val())
		
	$( function() {
		
		
	$( "#sldGrav" ).slider(	{value: 0, min: -2, max: 2, step:0.001, slide: function(a,b){slideGrav()}  }	 );
	
	
	
	} );
	
	$( function() {
		
		
	
	
	$( "#sldRigid" ).slider(	{value: 0.25, min: 0, max: 5, step:0.01, slide: function(a,b){slideRigid()}  }	 );
	
	} );
	
	$(".ui-slider .ui-slider-handle").css("height","10px")
	$(".ui-slider .ui-slider-handle").css("width","10px")
	
	function slideGrav(){ 	g = $("#sldGrav").slider("value") 
							$("#setGrav").val( g) 
							if(g<0)	{ 	$("#spnDown").css("border-style","none")
										$("#spnUp").css("border-style","solid")
										$("#spnUp").css( "background-color","#f9f983")
										$("#spnDown").css( "background-color","inherit")
										
									}
							else
									{
										$("#spnDown").css("border-style","solid")
										$("#spnUp").css("border-style","none")
										$("#spnUp").css( "background-color","inherit")
										$("#spnDown").css( "background-color","#f9f983")
									}
						}
						

	
	function slideRigid(){ $("#txtRigidity").val( $("#sldRigid").slider("value") ) 
		
						   freeze(1.0 * $("#txtRigidity").val() )
							}
	
	
		// animation loop $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   L O O O P   $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
		var loop = function() {
			
		/*		if(!doneHandle){$(".ui-slider-handle").css("height","10px")
				$(".ui-slider-handle").css("width","10px")
				}
		*/
				
			
			document.getElementById('simnum').textContent=''+simNumber
			document.getElementById('grav').textContent=grav.toFixed(4)
			
			newGrav=$('#setGrav').val()
			
			moreGrav=newGrav-grav
			if( Math.abs(moreGrav)>0.0001 )
			   {
				grav = grav + Math.sign(moreGrav) * dGrav
				sim.gravity.y = grav
				}
			$("#moreGrav").text(''+moreGrav.toFixed(3))
			
			
	
			pin0B.pos.x=pin0A.pos.x+25
			pin0B.pos.y=pin0A.pos.y
			
			pin1B.pos.x=pin1A.pos.x-25
			pin1B.pos.y=pin1A.pos.y
			
			
			
			
			if (!broken )
			{	maxBend=0.000012
					for (cn in angleConstraints)
						{
							var bend = Math.abs(Math.sin(angleConstraints[cn].angle - getAngle(cn) ) )
							if(bend>maxBend) {maxBend=bend}
							
							if(bend>0.08){	if(doFracture){angleConstraints[cn].stiffness = 0. ; broken=true }
										}
						}
			}	   
			$("#lblMaxBend").text(maxBend.toFixed(4))
			
			simNumber++
			sim.frame(16);
			sim.draw();
			requestAnimFrame(loop);
		};

		loop();
	};  //  windlow.onload ends here @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	
	
function txtGravChanged()
						{
							$("#sldGrav").slider("value", 1.0*$("#setGrav").val())
						}
	
function freeze( stif)
{    console.log(angleConstraints.length + ' angle constraints')
	 console.log(stif)
	 
	for (var cn in angleConstraints)
		{	var ancon=angleConstraints[cn]
			
			ancon.stiffness=stif
		//	ancon.angle= -Math.PI+(ancon.b.pos.sub(ancon.a.pos).angle(ancon.c.pos.sub(ancon.b.pos))
									
								  
			//ancon.angle=0
	
		
		}
}

function storeShape()
	{		broken = false
			for (var cn in angleConstraints)
			{	
				angleConstraints[cn].angle= getAngle(cn)
										
				                      
			}
			
			freeze(0.25)
			$("#txtRigidity").val(0.25)
			$("#sldRigid").slider("value",0.25)
	}
	
function getAngle(cn){  var ancon = angleConstraints[cn]
	
						return -Math.PI+(ancon.b.pos.sub(ancon.a.pos).angle(ancon.c.pos.sub(ancon.b.pos)))
				      }

function unfreeze()
{
	for (var cn in angleConstraints)
		{
			angleConstraints[cn].stiffness=0
			
			
		}
}

function setStiffness(){
								console.log(vv= $("#txtRigidity").val())
								freeze( vv)
								$("#sldRigid").slider("value",vv)
							}

