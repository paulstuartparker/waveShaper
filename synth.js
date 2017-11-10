const Contour = require('audio-contour');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
const lpf2 = audioCtx.createBiquadFilter();
const connectorGain = audioCtx.createGain();
const gainNode = audioCtx.createGain();
// const env = Contour(audioCtx);
// env.duration = 2;

hpf.type='highpass';
lpf.type='lowpass';
lpf2.type = "lowpass";
lpf2.frequency = 19000;

const keyboard = new QwertyHancock({
                 id: 'keyboard',
                 width: 600,
                 height: 100,
                 octaves: 2,
                 startNote: 'c3',
                 whiteNotesColour: 'white',
                 blackNotesColour: 'black',
                 hoverColour: '#f3e939',
            });


const attack = document.getElementById('attack');
const decay = document.getElementById('decay');
const initialGain = document.getElementById('init-gain');
const volume = document.getElementById('volume');
const lfoknob = document.getElementById('lfo');
const distortionknob = document.getElementById('distortion');
const distortionVolKnob = document.getElementById('distortionVol');
const reverbVolKnob = document.getElementById('reverb-vol');
const reverbButton = document.getElementById('reverb-button');
const lfoVolume = document.getElementById('lfo-volume');
const thresholdKnob = document.getElementById('threshold');
const kneeKnob = document.getElementById('knee');
const ratioKnob = document.getElementById('ratio');
const lpfFreq = document.getElementById('lpf-freq');
const hpfFreq = document.getElementById('hpf-freq');


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

// document.addEventListener('keydown', function(e){
//   debugger
//   return null;
// });

// osc1
const prefilterfilter = audioCtx.createBiquadFilter;
prefilterfilter.type = 'lowpass';
distortionVol.gain.value = 2.0;
const osc1VolumePreFilter = audioCtx.createGain();
osc1VolumePreFilter.gain.value = .3;
const preDist = audioCtx.createGain();
const osc1wave = document.getElementById('osc1-waveform');
const osc1octave = document.getElementById('osc1-octave');
const postAttackGain = document.getElementById('osc1-gain');
postAttackGain.addEventListener('input', function() {
  osc1VolumePreFilter.gain.value = postAttackGain.value;
});
preDist.gain.value = 1;
osc1VolumePreFilter.connect(lpf);
// prefilterfilter.connect(lpf);
let distConnected = false;
connectOsc1();
const analyser = audioCtx.createAnalyser();


gainNode.connect(lpf2);
lpf2.connect(analyser);
analyser.connect(audioCtx.destination);

function connectOsc1() {

  if (distConnected) {
    preDist.disconnect(distortion);
  }
  preDist.connect(gainNode);
  distConnected = false;
}

volume.addEventListener('input', function() {
  gainNode.gain.value = volume.value;
});
//end oscillator 1

//distortion node

const distortionCheck = document.getElementById('toggle-distortion');

distortionCheck.addEventListener('change', function() {

  if (distortionCheck.checked) {
    preDist.disconnect(gainNode);
    preDist.connect(distortion);
    distortion.connect(distortionVol);
    distortionVol.connect(gainNode);
    distConnected = true;
  } else {
    connectOsc1();
  }
});



var threshold = -27; // dB
var headroom = 21; // dB

function dBToLinear(db) {
    return Math.pow(10.0, 0.05 * db);
}

function e4(x, k)
{
    return 1.0 - Math.exp(-k * x);
}


function shape(x) {
    var linearThreshold = dBToLinear(threshold);
    var linearHeadroom = dBToLinear(headroom);

    var maximum = 1.05 * linearHeadroom * linearThreshold;
    var kk = (maximum - linearThreshold);

    var sign = x < 0 ? -1 : +1;
    var absx = Math.abs(x);

    var shapedInput = absx < linearThreshold ? absx : linearThreshold + kk * e4(absx - linearThreshold, 1.0 / kk);
    shapedInput *= sign;

    return shapedInput;
}

function generateColortouchCurve(curve) {
    var n = 65536;
    var n2 = n / 2;

    for (var i = 0; i < n2; ++i) {
        x = i / n2;
        x = shape(x);

        curve[n2 + i] = x;
        curve[n2 - i - 1] = -x;
    }

    return curve;
}


function generateMirrorCurve(curve) {
    var n = 65536;
    var n2 = n / 2;

    for (var i = 0; i < n2; ++i) {
        x = i / n2;
        x = shape(x);

        curve[n2 + i] = x;
        curve[n2 - i - 1] = x;
    }

    return curve;
}

const curve = new Float32Array(65536);
distortion.curve = generateColortouchCurve(curve);
distortion.oversample = '2x';
//end distortion node



const oscillators = {};
let isStop = true;
let intervalId;

const gainNodeTable = {};

const octaveTable = {
  "-2": .25,
  "-1": .5,
  "0": 1,
  "1": 2,
  "2": 4
};
lpf.frequency = 22000;
hpf.frequency.value = 5;
hpf.Q = .9;
lpf.connect(hpf);
hpf.connect(preDist);

function logSlider(val, minL, maxL) {
  let min = 0;
  let max = 100;
  let minLval = Math.log(minL);
  let maxLval = Math.log(maxL);
  let scale = (maxLval - minLval) / (max - min);
  return Math.exp((val - min) * scale + minLval);
}


lpfFreq.addEventListener('input', function() {
  lpf.frequency.value = logSlider(lpfFreq.value, 40, 22050);
});

hpfFreq.addEventListener('input', function() {
  hpf.frequency.value = hpfFreq.value;
});
// const osc2 = audioCtx.createOscillator();
// const pinkNoise = audioCtx.createOscillator();

const lfoOn = document.getElementById('toggle-lfo');

lfoVolume.addEventListener('input', function(){
  lfoOut.gain.value = lfoVolume.value;
});

// dry.addEventListener('input', function() {
//   dry.gain.value = dryKnob.value;
// });



lfoknob.addEventListener('input', function() {
  lfo.frequency.value = lfoknob.value;

});

const lfoTable = {};
const lfo = audioCtx.createOscillator();
const lfoOut = audioCtx.createGain();
lfo.connect(lfoVol.gain);
// lfo.frequency.value = lfoknob.value;
lfoVol.connect(lfoOut);
lfoOut.connect(lpf);
lfo.start();

function rampLfo(now, LfoOsc, lfoGain, lfoGainVol){
  lfoGain.connect(lfoGainVol);
  lfoGain.gain.cancelScheduledValues(now);
  lfoGain.gain.setValueAtTime(0, now);
  lfoGain.gain.linearRampToValueAtTime(lfoOut.gain.value, (now + parseInt(attack.value)));
  LfoOsc.connect(lfoGain);

  lfoGainVol.connect(lfoVol);
  // lfoGain.connect(Osc.frequency);
  // Osc.connect(lfoVol);
}

let osc1Vol;
keyboard.keyDown = function(note, freq) {
  let now = audioCtx.currentTime;
  const oscFilter = audioCtx.createBiquadFilter();
  const osc1 = audioCtx.createOscillator();
  if (oscillators[freq]) {
    oscillators[freq].stop(now);
  }
  if (oscillators[freq + 6000]) {
    oscillators[freq + 6000].stop(now);
  }
  if (gainNodeTable[freq]) {
    osc1Vol = gainNodeTable[freq];
    osc1Vol.gain.cancelScheduledValues(now);
    osc1Vol.gain.setValueAtTime(osc1Vol.gain.value, now);
  } else {
    osc1Vol = audioCtx.createGain();
    osc1Vol.gain.setValueAtTime(0, now);
  }
  osc1.connect(osc1Vol);
  osc1.type = osc1wave.value;
  osc1.frequency.value = (freq * octaveTable[osc1octave.value]);
  oscillators[freq] = osc1;
  gainNodeTable[freq] = osc1Vol;
  osc1Vol.connect(osc1VolumePreFilter);
  osc1Vol.gain.linearRampToValueAtTime(osc1VolumePreFilter.gain.value, (now + parseInt(attack.value)));
  osc1.start();
  if (lfoOn.checked) {
    // debugger
    const lfoGain = audioCtx.createGain();
    const lfoGainVol = audioCtx.createGain();
    lfoTable[freq] = lfoGain;
    lfoTable[freq + 12025] = lfoGainVol;
    const lfoOsc = audioCtx.createOscillator();
    rampLfo(now, lfoOsc, lfoGain, lfoGainVol);
    oscillators[freq + 6000] = lfoOsc;
    lfoOsc.frequency.value = freq * octaveTable[osc1octave.value];
    lfoOsc.start(now);
  }
};

keyboard.keyUp = function(note, freq) {
    const now = audioCtx.currentTime;
    const gain = gainNodeTable[freq].gain.value;
    gainNodeTable[freq].gain.cancelScheduledValues(now);
    gainNodeTable[freq].gain.setValueAtTime(gain, now);
    gainNodeTable[freq].gain.exponentialRampToValueAtTime(0.0001, now + parseInt(decay.value));
    oscillators[freq].stop(now + parseInt(decay.value));
    if (oscillators[freq + 6000]) {
      oscillators[freq + 6000].stop(now + parseInt(decay.value));
    }
    if (lfoTable[freq] ) {
      // debugger
      let lfoGain = lfoTable[freq + 12025];
      lfoGain.gain.cancelScheduledValues(now);
      lfoGain.gain.setValueAtTime(lfoVol.gain.value, now);
      lfoGain.gain.exponentialRampToValueAtTime(0.0001, now + parseInt(decay.value));
    }
};

const ctx = document.getElementById('my-canvas');
const canvas = ctx.getContext('2d');
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const WIDTH = 500;
const HEIGHT = 150;

function draw() {
  requestAnimationFrame(draw);
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  canvas.beginPath();
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);
  canvas.lineWidth = 3;
  canvas.strokeStyle = 'rgb(0, 0, 0)';
  let x = 0;
  for (var i = 0; i < bufferLength; i++) {
    let val = dataArray[i];
    let percent = val / 256;
    let height = HEIGHT * percent;
    let offset = HEIGHT - height - 1;
    const barWidth = WIDTH / bufferLength;
    canvas.fillStyle = 'black';
    canvas.fillRect(i * barWidth, offset, 1, 1)
  }

}

draw();
