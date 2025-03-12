import { useEffect, useRef } from "react";

export interface AudioVisComponentProps {
    stream: MediaStream;
    agentState?: string
    colors?: string[]
}

export function CircleOut({ stream }: AudioVisComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const numberOfLines = 512
  const numberOfBars = 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const length = new Array(numberOfBars).fill(1);
    let normSamples = new Array(numberOfLines).fill(0);

    const draw = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);
        
      if(analyserRef.current && freqArrayRef.current) {
          normSamples = new Array(analyserRef.current.frequencyBinCount).fill(0);
          analyserRef.current.getByteTimeDomainData(freqArrayRef.current);
          normSamples = Array.from(freqArrayRef.current).map(e => Math.abs((e/128) - 1) * 40);
      }

      const barsArr = new Array(numberOfBars).fill(0);
      for(let i=0; i<barsArr.length; i++) {
          const eles:number = Math.floor(normSamples.length/barsArr.length);
          let sum = 0;
          const st = i*eles, ed= Math.min(i*eles+eles, normSamples.length);
          for(let j=st; j<ed; j++) {
              sum += normSamples[j];
          }
          console.log("Sum: ", sum, "Eles: ", eles); 
          barsArr[i] = sum/eles;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width/4;

      // divide the ciccle into number of bars parts angles
      const angle = 2 * Math.PI / barsArr.length;
      for(let i=0; i<barsArr.length; i++) {
        const barHeight = 5 + 3 * barsArr[i];
        if(length[i]<barHeight) length[i] = barHeight;
        else length[i] -= length[i] * 0.05;
        const x = centerX + Math.cos(angle * i) * (radius );
        const y = centerY + Math.sin(angle * i) * (radius );
        const xEnd = centerX + Math.cos(angle * i ) * (radius + length[i] * 1.5 );
        const yEnd = centerY + Math.sin(angle * i) * (radius +  length[i] * 1.5 );

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xEnd, yEnd);
        const gradient = ctx.createLinearGradient(x, y, xEnd, yEnd);
        gradient.addColorStop(0, "#6366f1");
        gradient.addColorStop(1, "#a855f7");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3; // Increase the width
        ctx.stroke();
      }


      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      cancelAnimationFrame(animationRef.current!)
    }

  }, [])

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    analyserRef.current = audioContext.createAnalyser();
    const audioSource = audioContext.createMediaStreamSource(stream);

    analyserRef.current.fftSize = numberOfLines; // Higher FFT size for smoother animation
    const bufferLength = analyserRef.current.fftSize;
    freqArrayRef.current = new Uint8Array(bufferLength);
    audioSource.connect(analyserRef.current);

    return () => {
      audioContext.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width="200"
      height="200"
    ></canvas>
  );
}
