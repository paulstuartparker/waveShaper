const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc1 = audioCtx.createOscillator();
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
hpf.type='highpass';
lpf.type='lowpass';


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

osc1.type = 'sine';
osc1.frequency.value = 80;
lfo.frequency.value = 0.0;
masterVol.gain.value = volume.value;
osc1.start();
lfo.start();
lfo.connect(gainNode.gain);
osc1.connect(gainNode);
gainNode.connect(lfoVol);
lfoVol.connect(masterVol);
osc1.connect(distortion);
osc1.connect(osc1Vol);
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
gainNode.connect(convolver);
convolver.connect(reverbVol);
reverbVol.connect(masterVol);
masterVol.connect(lpf);
lpf.connect(hpf);
hpf.connect(masterCompression);
// dry.connect(masterCompression);
masterCompression.connect(audioCtx.destination);
// masterVol.connect(convolver);

function distortionCurve(amount = 0) {
  const sampleRate = 22500;
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


  distortion.oversample = '4x';
});

volume.addEventListener('input', function(){
  masterVol.gain.value = volume.value;

});

frequency.addEventListener('input', function() {
  osc1.frequency.value = frequency.value;

});

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
const minVal = 40;
const maxVal = audioCtx.sampleRate / 2;
lpfFreq.min = minVal;
lpfFreq.max =maxVal;
// function changeFrequency(element) {
//   const numOctaves = Math.log(maxVal/minVal) / Math.LN2;
//   let multiplier = Math.pow(2, numOctaves, element.value - 1.0);
//   debugger
//   return maxVal * multiplier;
// }


lpfFreq.addEventListener('input', function() {
  lpf.frequency.value = lpfFreq.value;
});

lpfQ.addEventListener('input', function() {
  lpf.Q.value = lpfQ.value;
});
