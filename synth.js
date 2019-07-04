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
gainNode.gain.value = 1;
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


const osc2VolumePreFilter = audioCtx.createGain();
distortionVol.gain.value = 1.5;
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
const mirrorCurve = audioCtx.createWaveShaper();
const analyser = audioCtx.createAnalyser();
const splitter = audioCtx.createChannelSplitter(2);
const mirrorGain = audioCtx.createGain();
const distGain = audioCtx.createGain();
const merger = audioCtx.createChannelMerger(2);
const masterVolume = audioCtx.createGain();
masterVolume.gain.value = 0.7;
distGain.gain.value = 2;
mirrorGain.gain.value = 2;
splitter.connect(distortion, 0);
splitter.connect(mirrorCurve, 1);
distortion.connect(distGain);
mirrorCurve.connect(mirrorGain);
distGain.connect(distortionVol);
mirrorGain.connect(distortionVol);
gainNode.connect(lpf2);

lpf2.connect(masterVolume);
const compressor = audioCtx.createDynamicsCompressor();
masterVolume.connect(compressor);
compressor.threshold.value = -24;
compressor.knee.value = 24;
compressor.ratio.value = 4;
compressor.attack.value = .001;
compressor.release.value = 0.15;
compressor.connect(analyser);
analyser.connect(audioCtx.destination);

function connectOsc1() {

  if (distConnected) {
    distortionVol.disconnect(gainNode);
    preDist.disconnect(splitter);
  }
  preDist.connect(gainNode);
  distConnected = false;
}

volume.addEventListener('input', function() {
  masterVolume.gain.value = volume.value;
});
//end oscillator 1

//distortion node
//Big Thanks to Google and Chris Wilson for the Distortion Algorithm.
const distortionCheck = document.getElementById('toggle-distortion');

distortionCheck.addEventListener('change', function() {

  if (distortionCheck.checked) {
    preDist.disconnect(gainNode);
    preDist.connect(splitter);
    // merger.connect(distortionVol);
    distortionVol.connect(gainNode);
    distConnected = true;
  } else {
    connectOsc1();
  }
});



let threshold = -21;
let headroom = 7;
//original headroom = 21
//original thresh = -27

function dBToLinear(db) {
    return Math.pow(10.0, 0.05 * db);
}

function e4(x, k)
{
    return 1.0 - Math.exp(-k * x);
}


function shape(x) {
    let linearThreshold = dBToLinear(threshold);
    let linearHeadroom = dBToLinear(headroom);

    let maximum = 1.05 * linearHeadroom * linearThreshold;
    let kk = (maximum - linearThreshold);

    let sign = x < 0 ? -1 : +1;
    let absx = Math.abs(x);

    let shapedInput = absx < linearThreshold ? absx : linearThreshold + kk * e4(absx - linearThreshold, 1.0 / kk);
    shapedInput *= sign;

    return shapedInput;
}

function generateColortouchCurve(curve) {
    let n = 65536;
    let n2 = n / 2;

    for (let i = 0; i < n2; ++i) {
        x = i / n2;
        x = shape(x);

        curve[n2 + i] = x;
        curve[n2 - i - 1] = -x;
    }

    return curve;
}


function generateMirrorCurve(curve) {
    let n = 65536;
    let n2 = n / 2;

    for (let i = 0; i < n2; ++i) {
        x = i / n2;
        x = shape(x);

        curve[n2 + i] = x;
        curve[n2 - i - 1] = x;
    }

    return curve;
}

const curve = new Float32Array(65536);
let newCurve = generateMirrorCurve(curve);
mirrorCurve.curve = generateMirrorCurve(curve);
mirrorCurve.oversample = '4x';
distortion.curve = generateColortouchCurve(newCurve);
distortion.oversample = '4x';
//end distortion node

//delay node
const toggleDelay = document.getElementById('toggle-delay');
const delayVolume = document.getElementById('delay-mix');
const delayTime = document.getElementById('delay-time');
const delay = audioCtx.createDelay();
const delayMix = audioCtx.createGain();
const delayFilter = audioCtx.createBiquadFilter();
delayFilter.frequency.value = 900;
delay.connect(delayMix);
delayMix.connect(delayFilter);
delayFilter.connect(delay);
delay.connect(lpf2);
delayMix.gain.value = .4;
delay.delayTime.value = 0.5;
delayVolume.addEventListener('input', function() {
  delayMix.gain.value = delayVolume.value;
});

delayTime.addEventListener('input', function() {
  delay.delayTime.value = delayTime.value;
});

toggleDelay.addEventListener('change', function() {
  if (toggleDelay.checked) {
    gainNode.connect(delay);
  } else {
    gainNode.disconnect(delay);
  }
});


//end delay

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
lfoOut.gain.value = .3;
lfo.connect(lfoVol.gain);
lfoVol.connect(lfoOut);
lfoOut.connect(lpf);
lfo.start();

function rampLfo(now, LfoOsc, lfoGain, lfoGainVol){
  lfoGain.connect(lfoGainVol);
  lfoGain.gain.cancelScheduledValues(now);
  lfoGain.gain.setValueAtTime(0, now);
  lfoGain.gain.linearRampToValueAtTime(lfoOut.gain.value, (now + parseFloat(attack.value)));
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
  osc1Vol.gain.linearRampToValueAtTime(osc1VolumePreFilter.gain.value, (now + parseFloat(attack.value)));
  osc2Vol.gain.linearRampToValueAtTime(osc2VolumePreFilter.gain.value, (now + parseFloat(attack.value)));

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
    gainNodeTable[freq].gain.exponentialRampToValueAtTime(0.0001, now + parseFloat(decay.value));
    // debugger
    gainNodeTable[freq + 20000].gain.cancelScheduledValues(now);
    gainNodeTable[freq + 20000].gain.setValueAtTime(gain2, now);
    gainNodeTable[freq + 20000].gain.exponentialRampToValueAtTime(0.0001, now + parseFloat(decay.value));
    oscillators[freq].stop(now + parseFloat(decay.value));
    oscillators[freq + 20000].stop(now + parseFloat(decay.value));

    if (oscillators[freq + 6000]) {
      oscillators[freq + 6000].stop(now + parseFloat(decay.value));
    }
    if (lfoTable[freq] ) {
      let lfoGain = lfoTable[freq + 12025];
      lfoGain.gain.cancelScheduledValues(now);
      lfoGain.gain.setValueAtTime(lfoVol.gain.value, now);
      lfoGain.gain.exponentialRampToValueAtTime(0.0001, now + parseFloat(decay.value));
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
  for (let i = 0; i < bufferLength; i++) {
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



//media record
let clicked = false;
let chunks = [];
const dest = audioCtx.createMediaStreamDestination();
const mediaRecorder = new MediaRecorder(dest.stream);
const trigger = document.getElementById('record');
const downloadButton = document.getElementById('download');
downloadButton.onclick = download;
downloadButton.disabled = true;
lpf2.connect(dest);



trigger.addEventListener('click', function(e) {
  if(!clicked) {
    chunks = [];
    mediaRecorder.start();
    e.target.innerHTML = "Stop";
    clicked = true;
  } else {
    mediaRecorder.requestData();
    mediaRecorder.stop();
    e.target.innerHTML = "Record";
    clicked = false;
  }
});


mediaRecorder.ondataavailable = function(evt) {
  chunks.push(evt.data);
};

mediaRecorder.onstop = function(evt) {
  let blob = new Blob(chunks, {'type':'audio/ogg; codecs=opus'});
  // let audioTag = document.createElement('audio');
  document.querySelector('audio').src = URL.createObjectURL(blob);
  downloadButton.disabled = false;
  downloadButton.className += 'active';
};

function download() {
  let blob = new Blob(chunks, {
    type: 'audio/ogg; codec=opus'
  });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'synth_recording.ogg';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
