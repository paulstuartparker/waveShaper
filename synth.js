const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc1Vol = audioCtx.createGain();
const osc2 = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
const lfo = audioCtx.createOscillator();
const lfoVol = audioCtx.createGain();
const masterVol = audioCtx.createGain();
const distortion = audioCtx.createWaveShaper();
const distortionVol = audioCtx.createGain();
const reverb = audioCtx.createConvolver();
const reverbVol = audioCtx.createGain();
const splitter = audioCtx.createChannelSplitter();
const masterCompression = audioCtx.createDynamicsCompressor();
const dry = audioCtx.createGain();
const hpf = audioCtx.createBiquadFilter();
const lpf = audioCtx.createBiquadFilter();
const connectorGain = audioCtx.createGain();
hpf.type='highpass';
lpf.type='lowpass';

const keyboard = new QwertyHancock({
                 id: 'keyboard',
                 width: 600,
                 height: 150,
                 octaves: 2,
                 startNote: 'C3',
                 whiteNotesColour: 'white',
                 blackNotesColour: 'black',
                 hoverColour: '#f3e939',
            });


const attack = document.getElementById('attack');
const decay = document.getElementById('decay');
const initialGain = document.getElementById('init-gain');
const volume = document.getElementById('volume');
const frequency = document.getElementById('frequency');
const lfoknob = document.getElementById('lfo');
const distortionknob = document.getElementById('distortion');
const distortionVolKnob = document.getElementById('distortionVol');
const reverbVolKnob = document.getElementById('reverb-vol');
const reverbButton = document.getElementById('reverb-button');
const osc1Gain = document.getElementById('osc1-gain');
const dryKnob = document.getElementById('dry');
const lfoVolume = document.getElementById('lfo-volume');
const thresholdKnob = document.getElementById('threshold');
const kneeKnob = document.getElementById('knee');
const ratioKnob = document.getElementById('ratio');
const lpfFreq = document.getElementById('lpf-freq');
const lpfQ = document.getElementById('lpf-Q');
const hpfFreq = document.getElementById('hpf-freq');
connectorGain.connect(distortion);
connectorGain.connect(gainNode);
connectorGain.connect(osc1Vol);
lfo.frequency.value = 0.0;
masterVol.gain.value = volume.value;
lfo.start();
lfo.connect(gainNode.gain);
gainNode.connect(lfoVol);
lfoVol.connect(masterVol);
osc1Vol.connect(masterVol);

distortion.connect(distortionVol);
distortionVol.connect(masterVol);



//reverb section
const convolver = audioCtx.createConvolver();
const reverbBuffer = audioCtx.createBufferSource();
const getSound = new XMLHttpRequest();
getSound.open('GET', 'stalbans_a_mono.wav', true);
getSound.responseType="arraybuffer";
getSound.onload = function() {
  audioCtx.decodeAudioData(getSound.response, function(buffer){
    console.log(buffer);
    convolver.buffer = buffer;
  });
  getSound.send();
};


//
// gainNode.connect(convolver);
// convolver.connect(reverbVol);
// reverbVol.connect(masterVol);
masterVol.connect(lpf);
lpf.connect(hpf);
hpf.connect(audioCtx.destination);
// dry.connect(masterCompression);
// masterCompression.connect(audioCtx.destination);
// masterVol.connect(convolver);

function distortionCurve(amount = 0) {
  const sampleRate = 44100;
  const curve = new Float32Array(sampleRate);
  const deg = Math.PI / 180;

  for (let i = 0; i < sampleRate; ++i) {
    const x = (i * 2 / sampleRate) - 1;
    curve[i] = (
      (
        (3 + amount) * x * 20 * deg
      ) / (
        (amount * Math.abs(x)) + Math.PI
      )
    );
  }

  return curve;
}

lfoVolume.addEventListener('input', function(){
  lfoVol.gain.value = lfoVolume.value;
});

dry.addEventListener('input', function() {
  dry.gain.value = dryKnob.value;
});

osc1Gain.addEventListener('input', function() {
  osc1Vol.gain.value = osc1Gain.value;
});

distortionknob.addEventListener('input', function() {
  distortion.curve = distortionCurve(distortionknob.value);


  distortion.oversample = '2x';
});

volume.addEventListener('input', function(){
  masterVol.gain.value = volume.value;

});
//
// frequency.addEventListener('input', function() {
//   osc1.frequency.value = frequency.value;
//
// });
lfoknob.addEventListener('input', function() {
  lfo.frequency.value = lfoknob.value;
});

distortionVolKnob.addEventListener('input', function() {
  distortionVol.gain.value = distortionVolKnob.value;
});

reverbVolKnob.addEventListener('input', function() {
  reverbVol.gain.value = reverbVolKnob.value;

});

thresholdKnob.addEventListener('input', function() {
  masterCompression.threshold.value = thresholdKnob.value;
});

kneeKnob.addEventListener('input', function() {
  masterCompression.knee.value = kneeKnob.value;
});

ratioKnob.addEventListener('input', function() {
  masterCompression.ratio.value = ratioKnob.value;
});
// const minVal = 40;
// const maxVal = audioCtx.sampleRate / 2;
// lpfFreq.min = minVal;
// lpfFreq.max = maxVal;

const oscillators = {};
let isStop = true;
let intervalId;

keyboard.keyDown = function(note, freq) {
  let now = audioCtx.currentTime;
  // if (!isStop) {
  //   if (oscillators[freq]) {
  //     oscillators[freq].stop(now);
  //     oscillators[Math.floor(freq / 2)].stop(now);
  //   }
  //  }
  const osc1 = audioCtx.createOscillator();
  osc1.connect(connectorGain);
  osc1.type = 'sine';
  osc1.frequency.value = freq;
  oscillators[freq] = osc1;
  osc1.start(now);
  const osc3 = audioCtx.createOscillator();
  osc3.connect(connectorGain);
  osc3.frequency.value = (freq * (2 * 2));
  oscillators[Math.floor(freq / 2)] = osc3;
  osc3.start(now);
  osc3.type = 'square';
  connectorGain.gain.cancelScheduledValues(now);
  connectorGain.gain.setValueAtTime(0, Math.floor(now));
  connectorGain.gain.linearRampToValueAtTime(1.0, ((now) + parseInt(attack.value)));
  // isStop = false;
};

keyboard.keyUp = function (note, freq) {
    // if (isStop) {
    //   return;
    // }
    const now = audioCtx.currentTime;
    const gain = connectorGain.gain.value;
    connectorGain.gain.cancelScheduledValues( now );
    connectorGain.gain.setValueAtTime(gain, now);
    // connectorGain.gain.linearRampToValueAtTime(0, (now + parseInt(decay.value)));
    // connectorGain.gain.exponentialRampToValueAtTime(0.000001, now + .0001);

    oscillators[freq].stop(now + .0001);
    oscillators[Math.floor(freq / 2)].stop(now + .0001);
    // connectorGain.gain.linearRampToValueAtTime(0, (now + parseInt(decay.value)));
    // connectorGain.gain.setTargetAtTime(0, (now), .15);
    // this.osc_node.stop(stop_time + this.decay);
    // intervalId = window.setInterval(function() {
    //   // debugger
    //   if (connectorGain.gain.value < 1e-3) {
    //     // debugger
    //     oscillators[freq].stop();
    //     oscillators[Math.floor(freq / 2)].stop();
    //     if (intervalId !== null) {
    //       window.clearInterval(intervalId);
    //       intervalId = null;
    //     }
    //     isStop = true;
    //   }
    // }, 0);
};


lpfFreq.addEventListener('input', function() {
  lpf.frequency.value = lpfFreq.value;
});

hpfFreq.addEventListener('input', function() {
  hpf.frequency.value = hpfFreq.value;
});
