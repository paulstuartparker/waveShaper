const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc1 = audioCtx.createOscillator();
const osc2 = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
const lfo = audioCtx.createOscillator();
const masterVol = audioCtx.createGain();
const distortion = audioCtx.createWaveShaper();
const distortionVol = audioCtx.createGain();

const volume = document.getElementById('volume');
const frequency = document.getElementById('frequency');
const lfoknob = document.getElementById('lfo');
const distortionknob = document.getElementById('distortion');
const distortionVolKnob = document.getElementById('distortionVol');


osc1.type = 'sine';
osc1.frequency.value = 80;
lfo.frequency.value = 0.0;
lfo.connect(gainNode.gain);
osc1.connect(gainNode);
masterVol.gain.value = volume.value;
osc1.start();
lfo.start();
gainNode.connect(distortion);
gainNode.connect(masterVol);
distortion.connect(distortionVol);
distortionVol.connect(masterVol);
masterVol.connect(audioCtx.destination);


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
distortionknob.addEventListener('input', function() {
  distortion.curve = distortionCurve(distortionknob.value);
  console.log(distortionknob.value);
  console.log(distortion.curve);

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
