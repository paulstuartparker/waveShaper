const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const osc1 = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();

osc1.connect(gainNode);
gainNode.connect(audioCtx.destination);
