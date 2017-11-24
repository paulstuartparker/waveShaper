# waveShaper

WaveShaper is a fully functional digital synthesizer built in javascript.
Check out the live version [Here](https://paulstuartparker.github.io/waveShaper/ "here")

## Implementation

waveShaper makes extensive use of the web audio api, some dsp techniques, and an organized but intricate audio graph for the routing.
There are two oscillators which generate the signal, as well as a low-frequency oscillator which generates a sine wave and modulates volume 
based on another oscillators frequency.  

The signal is then processed through various audio nodes and effects, and ultimately routed to the speakers as well as an audio
analyser node, which generates the waveform display with the use of a method called getByteTimeData and the canvas API. 

Since the amount of Hz between notes increases exponentially as you move up in pitch(e.g. the difference between an octave on the low end of the piano is 110 Hz, but the difference between an octave at the upper end of the piano is 1760 Hz), the Low Pass Filter and High Pass Filter have logarithmically scaled sliders to ensure the best possible user experience.

![delay](delay.gif)


The layout follows the signal flow of the synthesizer from the left of the page to the right. The signal starts at the  oscillators which generate a wave, which is then routed through the filters, and finally to the speakers and waveform display.  
I also implemented a help feature, allowing users to hover their mouse over a component's title if they want more information 
about how to use it.

![modal](modal.gif)

This project uses a library for the keyboard called 'querty hancock'.  In building this project
I relied on the expertise of Chris Wilson and Chris Lowis who both have extensive materials on the subject posted on the internet.  
I also heavily relied on the MDN docs for information about the web audio api.  


