const osc1Help = document.getElementById("osc1-text");
const osc2Help = document.getElementById("osc2-text");
const lfoHelp = document.getElementById("lfo-title");
const distortionHelp = document.getElementById("distortion-text");
const envelopeHelp = document.getElementById("envelope-title");
const lpfHelp = document.getElementById("lpf-text");
const hpfHelp = document.getElementById("hpf-text");
const delayHelp = document.getElementById("delay-label");
const lpfDescription = document.getElementById("lpf-description");
const hpfDescription = document.getElementById("hpf-description");
const oscDescription = document.getElementById("osc-description");
const lfoDescription = document.getElementById("lfo-description");
const distDescription = document.getElementById("distortion-description");
const delayDescription = document.getElementById("delay-description");
const recordHelp = document.getElementById("record-help");
const recordDescription = document.getElementById("record-description");
const envelopeDescription = document.getElementById("envelope-description");
osc1Help.addEventListener('mouseover', function() {
  oscDescription.style.display = 'block';
});

osc1Help.addEventListener('mouseleave', function() {
  oscDescription.style.display = 'none';
});

osc2Help.addEventListener('mouseover', function() {
  oscDescription.style.display = 'block';
});

osc2Help.addEventListener('mouseleave', function() {
  oscDescription.style.display = 'none';
});

lfoHelp.addEventListener('mouseover', function() {
  lfoDescription.style.display = 'block';
});

lfoHelp.addEventListener('mouseleave', function() {
  lfoDescription.style.display = 'none';
});

distortionHelp.addEventListener('mouseover', function() {
  distDescription.style.display = 'block';
});

distortionHelp.addEventListener('mouseleave', function() {
  distDescription.style.display = 'none';
});

recordHelp.addEventListener('mouseover', function() {
  recordDescription.style.display = 'block';
});

recordHelp.addEventListener('mouseleave', function() {
  recordDescription.style.display = 'none';
});



envelopeHelp.addEventListener('mouseover', function() {
  envelopeDescription.style.display = 'block';
});

envelopeHelp.addEventListener('mouseleave', function() {
  envelopeDescription.style.display = 'none';
});

lpfHelp.addEventListener('mouseover', function() {
  lpfDescription.style.display = 'block';
});

lpfHelp.addEventListener('mouseleave', function() {
  lpfDescription.style.display = 'none';
});


hpfHelp.addEventListener('mouseover', function() {
  hpfDescription.style.display = 'block';
});

hpfHelp.addEventListener('mouseleave', function() {
  hpfDescription.style.display = 'none';
});


delayHelp.addEventListener('mouseover', function() {
  delayDescription.style.display = 'block';
});

delayHelp.addEventListener('mouseleave', function() {
  delayDescription.style.display = 'none';
});
