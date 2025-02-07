class MyWorkletProcessor extends AudioWorkletProcessor
   { constructor() {super();}
       
       process(inputs,outputs){
       }
    }
    
registerProcessor('my-worklet-processor','MyWorkletProcessor')
