import buttonClick from "./effects/soundclick.wav";

const buttonAudio: HTMLAudioElement = new Audio(buttonClick);

const playButtonAudio = () => {
  buttonAudio.currentTime = 0;
  buttonAudio.play();
};

export default playButtonAudio;
