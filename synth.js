const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const lfoVol = audioCtx.createGain();
const masterVol = audioCtx.createGain();
const distortion = audioCtx.createWaveShaper();
const distortionVol = audioCtx.createGain();
const dry = audioCtx.createGain();
const hpf = audioCtx.createBiquadFilter();
const lpf = audioCtx.createBiquadFilter();
const lpf2 = audioCtx.createBiquadFilter();
const connectorGain = audioCtx.createGain();
const gainNode = audioCtx.createGain();


hpf.type='highpass';
lpf.type='lowpass';
lpf2.type = "lowpass";
lpf2.frequency = 22050;

const keyboard = new QwertyHancock({
                 id: 'keyboard',
                 width: 500,
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
const lfoVolume = document.getElementById('lfo-volume');
const lpfFreq = document.getElementById('lpf-freq');
const hpfFreq = document.getElementById('hpf-freq');



// osc1

const osc2VolumePreFilter = audioCtx.createGain();
distortionVol.gain.value = 2.0;
const osc1VolumePreFilter = audioCtx.createGain();
osc1VolumePreFilter.gain.value = .3;
osc2VolumePreFilter.gain.value = 0;

const preDist = audioCtx.createGain();
const osc1wave = document.getElementById('osc1-waveform');
const osc1octave = document.getElementById('osc1-octave');
const postAttackGain = document.getElementById('osc1-gain');
const osc2wave = document.getElementById('osc2-waveform');
const osc2octave = document.getElementById('osc2-octave');
const postAttackGain2 = document.getElementById('osc2-gain');



postAttackGain.addEventListener('input', function() {
  osc1VolumePreFilter.gain.value = postAttackGain.value;
});
postAttackGain2.addEventListener('input', function() {
  osc2VolumePreFilter.gain.value = postAttackGain2.value;
});
preDist.gain.value = .9;
osc2VolumePreFilter.connect(lpf);
osc1VolumePreFilter.connect(lpf);

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



var threshold = -27;
var headroom = 21;

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


lpf.frequency.value = 22050;
hpf.frequency.value = 5;
hpf.Q = 2;
lpf.Q = 2;
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
  lpf.frequency.value = logSlider(parseInt(lpfFreq.value), 40, 22050);
});

hpfFreq.addEventListener('input', function() {
  hpf.frequency.value = logSlider(parseInt(hpfFreq.value), 10, 22050);
});


const lfoOn = document.getElementById('toggle-lfo');

lfoVolume.addEventListener('input', function(){
  lfoOut.gain.value = lfoVolume.value;
});




lfoknob.addEventListener('input', function() {
  lfo.frequency.value = lfoknob.value;

});

const lfoTable = {};
const lfo = audioCtx.createOscillator();
const lfoOut = audioCtx.createGain();
lfoOut.gain.value = .2;
lfo.connect(lfoVol.gain);
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
}
let osc2Vol;
let osc1Vol;
keyboard.keyDown = function(note, freq) {
  let now = audioCtx.currentTime;
  const oscFilter = audioCtx.createBiquadFilter();
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  if (oscillators[freq + 20000]) {
    oscillators[freq + 20000].stop(now);
  }
  if (oscillators[freq]) {
    oscillators[freq].stop(now);
  }
  if (oscillators[freq + 6000]) {
    oscillators[freq + 6000].stop(now);
  }
  if (gainNodeTable[freq + 20000]) {
    osc2Vol = gainNodeTable[freq + 20000];
    osc2Vol.gain.cancelScheduledValues(now);
    osc2Vol.gain.setValueAtTime(osc2Vol.gain.value, now);
  } else {
    osc2Vol = audioCtx.createGain();
    osc2Vol.gain.setValueAtTime(0, now);
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
  oscillators[freq + 20000] = osc2;
  gainNodeTable[freq + 20000] = osc2Vol;
  osc2.connect(osc2Vol);
  osc2.type = osc2wave.value;
  osc2.frequency.value = (freq * octaveTable[osc2octave.value]);
  osc2Vol.connect(osc2VolumePreFilter);
  osc1Vol.connect(osc1VolumePreFilter);
  osc1Vol.gain.linearRampToValueAtTime(osc1VolumePreFilter.gain.value, (now + parseInt(attack.value)));
  osc2Vol.gain.linearRampToValueAtTime(osc2VolumePreFilter.gain.value, (now + parseInt(attack.value)));

  osc1.start();
  osc2.start();
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
    const gain2 = gainNodeTable[freq + 20000].gain.value;
    gainNodeTable[freq].gain.cancelScheduledValues(now);
    gainNodeTable[freq].gain.setValueAtTime(gain, now);
    gainNodeTable[freq].gain.exponentialRampToValueAtTime(0.0001, now + parseInt(decay.value));
    // debugger
    gainNodeTable[freq + 20000].gain.cancelScheduledValues(now);
    gainNodeTable[freq + 20000].gain.setValueAtTime(gain2, now);
    gainNodeTable[freq + 20000].gain.exponentialRampToValueAtTime(0.0001, now + parseInt(decay.value));
    oscillators[freq].stop(now + parseInt(decay.value));
    oscillators[freq + 20000].stop(now + parseInt(decay.value));

    if (oscillators[freq + 6000]) {
      oscillators[freq + 6000].stop(now + parseInt(decay.value));
    }
    if (lfoTable[freq] ) {
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
const WIDTH = 400;
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
    canvas.fillRect(i * barWidth, offset, 1, 1);
  }

}

draw();
