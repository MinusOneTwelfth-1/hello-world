/* first run this python cmd 

cd /home/pi/Desktop/singing/AI chats/scraping
python -m http.server 9196

*/

/*  paste this loader in console
//==========================

(
 function()
 {
 	console.log('loading')
 	injeck=document.createElement('script')
 	injeck.src='http://127.0.0.7:9196/geminiScraping.js'
 	document.head.appendChild(injeck)
 }
 
)()

//===============================
*/

// Scope our variables safely inside an Immediately Invoked Function Expression (IIFE)

(() => {
	
	fnAa=function(){console.log('aaa..aaa..aaa')}
	var grabbedBox;
	console.log("hi from geminiScraping.JS V2.1")
    let firstContainer = null;
    let firstText = "";
	
	
	
    // Helper function to extract the real HTML element from a selection node
    function getElementFromNode(node) {
        if (!node) return null;
        return node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    }
    
    

    document.addEventListener('keydown', (event) => {
		console.log("keypress!");
        const key = event.key.toLowerCase();

        // ---- FIRST SELECTION: Alt + Q ----
        if (event.altKey && key === 'q') {
            event.preventDefault();
            const selection = window.getSelection();
            
            if (selection.rangeCount > 0 && selection.toString().trim() !== "") {
                firstContainer = getElementFromNode(selection.anchorNode);
                firstText = selection.toString().trim();
                
                // Visual confirmation using a modern fallback style alert
                console.info("Target 1 Stored:", firstText);
                alert(`Target 1 Stored:\n"${firstText}"`);
            } else {
                alert("Please highlight text before pressing Alt + Q");
            }
        }

        // ---- SECOND SELECTION: Alt + W ----
        if (event.altKey && key === 'w') {
            event.preventDefault();
            
            if (!firstContainer) {
                alert("Error: Please set Target 1 first using Alt + Q!");
                return;
            }

            const selection = window.getSelection();
            
            if (selection.rangeCount > 0 && selection.toString().trim() !== "") {
                const secondContainer = getElementFromNode(selection.anchorNode);
                const secondText = selection.toString().trim();
                
                console.info("Target 2 Stored:", secondText);

                // Find the smallest shared container
                let sharedAncestor = firstContainer;

                // Traverse upwards from the first container until we find an element 
                // that structurally contains the second container node
                while (sharedAncestor && !sharedAncestor.contains(secondContainer)) {
                    sharedAncestor = sharedAncestor.parentElement;
                }

                // ---- THE RESULT ----
                if (sharedAncestor) {
					window.outBox=sharedAncestor;
                    console.info("--- SMALLEST COMMON CONTAINER ---");
                    console.info(sharedAncestor);
                    console.info("Tag:", sharedAncestor.tagName);
                    console.info("Classes:", sharedAncestor.className);
                    console.info("---------------------------------");
                    
                    // Flash the element yellow on screen so you can see it visually
                //    const originalBg = sharedAncestor.style.backgroundColor;
               //     sharedAncestor.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
                    
                    alert(`Smallest Common Container Found!\nTag: <${sharedAncestor.tagName.toLowerCase()}>\n\nCheck console.info or look at the highlighted page element.`);
              /*      
                    setTimeout(() => {
                        sharedAncestor.style.backgroundColor = originalBg;
                    }, 3000);
               */

                } else {
                    alert("No shared container found! Elements might be in different iframes.");
                }

                // Reset state for your next experiment run
                firstContainer = null;
                firstText = "";

            } else {
                alert("Please highlight text before pressing Alt + W");
            }
        }
    });
    
    console.info("Script active! Use Alt+Q for selection 1, then Alt+W for selection 2.");
})();
