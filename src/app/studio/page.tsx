'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import GIF from 'gif.js';

type AnimationStyle = 'bounce' | 'spin' | 'rainbow' | 'shake' | 'fade' | 'zoom';

export default function StudioPage() {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<AnimationStyle>('bounce');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const styles: { id: AnimationStyle; name: string; icon: string }[] = [
    { id: 'bounce', name: 'Bounce', icon: '🏀' },
    { id: 'spin', name: 'Spin', icon: '🔄' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈' },
    { id: 'shake', name: 'Shake', icon: '〰️' },
    { id: 'fade', name: 'Fade', icon: '👻' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' },
  ];

  // Animation preview
  useEffect(() => {
    if (!text || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Apply animation based on selected style
      switch (selectedStyle) {
        case 'bounce':
          const bounceY = 64 + Math.sin(frame * 0.15) * 20;
          ctx.fillStyle = '#4A154B';
          ctx.fillText(text, 64, bounceY);
          break;

        case 'spin':
          ctx.save();
          ctx.translate(64, 64);
          ctx.rotate((frame * 0.1) % (Math.PI * 2));
          ctx.fillStyle = '#1264A3';
          ctx.fillText(text, 0, 0);
          ctx.restore();
          break;

        case 'rainbow':
          const hue = (frame * 5) % 360;
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.fillText(text, 64, 64);
          break;

        case 'shake':
          const shakeX = 64 + Math.sin(frame * 0.5) * 5;
          ctx.fillStyle = '#E01E5A';
          ctx.fillText(text, shakeX, 64);
          break;

        case 'fade':
          const opacity = (Math.sin(frame * 0.1) + 1) / 2;
          ctx.fillStyle = `rgba(74, 21, 75, ${opacity})`;
          ctx.fillText(text, 64, 64);
          break;

        case 'zoom':
          const scale = 1 + Math.sin(frame * 0.1) * 0.3;
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#2EB67D';
          ctx.fillText(text, 0, 0);
          ctx.restore();
          break;
      }

      frame++;
      animationFrameRef.current = frame;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [text, selectedStyle]);

  const generateGIF = async () => {
    if (!text || !canvasRef.current) return;

    setIsGenerating(true);
    setDownloadUrl(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create GIF encoder
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 128,
      height: 128,
      workerScript: '/gif.worker.js',
    });

    // Generate frames
    const totalFrames = 20;
    for (let frame = 0; frame < totalFrames; frame++) {
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Apply animation
      switch (selectedStyle) {
        case 'bounce':
          const bounceY = 64 + Math.sin(frame * 0.3) * 20;
          ctx.fillStyle = '#4A154B';
          ctx.fillText(text, 64, bounceY);
          break;

        case 'spin':
          ctx.save();
          ctx.translate(64, 64);
          ctx.rotate((frame * 0.3) % (Math.PI * 2));
          ctx.fillStyle = '#1264A3';
          ctx.fillText(text, 0, 0);
          ctx.restore();
          break;

        case 'rainbow':
          const hue = (frame * 18) % 360;
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.fillText(text, 64, 64);
          break;

        case 'shake':
          const shakeX = 64 + Math.sin(frame * 1.5) * 5;
          ctx.fillStyle = '#E01E5A';
          ctx.fillText(text, shakeX, 64);
          break;

        case 'fade':
          const opacity = (Math.sin(frame * 0.3) + 1) / 2;
          ctx.fillStyle = `rgba(74, 21, 75, ${opacity})`;
          ctx.fillText(text, 64, 64);
          break;

        case 'zoom':
          const scale = 1 + Math.sin(frame * 0.3) * 0.3;
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#2EB67D';
          ctx.fillText(text, 0, 0);
          ctx.restore();
          break;
      }

      // Add frame to GIF
      gif.addFrame(canvas, { copy: true, delay: 100 });
    }

    // Render GIF
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsGenerating(false);
    });

    gif.render();
  };

  const downloadGIF = () => {
    if (!downloadUrl) return;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${text.replace(/\s+/g, '_')}_${selectedStyle}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-slack-purple hover:underline">
              ← Back to SlackDori
            </Link>
            <h1 className="text-2xl font-bold text-slack-purple">
              Emoji Studio
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Create Custom Emoji</h2>
            <p className="text-gray-600">
              Type your text, choose a style, and generate an animated GIF emoji
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Controls */}
              <div className="space-y-6">
                {/* Step 1: Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Enter Your Text
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 8))}
                    placeholder="Type here... (e.g., 🎉, WOW, 대박)"
                    maxLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slack-purple focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {text.length}/8 characters
                  </p>
                </div>

                {/* Step 2: Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Choose Animation Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedStyle === style.id
                            ? 'border-slack-purple bg-slack-purple text-white'
                            : 'border-gray-300 hover:border-slack-purple'
                        }`}
                      >
                        <span className="block text-2xl mb-1">{style.icon}</span>
                        <span className="text-sm">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Generate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Generate GIF
                  </label>
                  <button
                    onClick={generateGIF}
                    disabled={!text || isGenerating}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      !text || isGenerating
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-slack-purple text-white hover:bg-opacity-90'
                    }`}
                  >
                    {isGenerating ? 'Generating...' : 'Generate GIF'}
                  </button>
                </div>

                {/* Download Button */}
                {downloadUrl && (
                  <button
                    onClick={downloadGIF}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    📥 Download GIF
                  </button>
                )}
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Live Preview
                </label>
                <div className="bg-gray-100 rounded-lg p-8">
                  <canvas
                    ref={canvasRef}
                    width={128}
                    height={128}
                    className="bg-white rounded shadow-md"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  128x128px - Slack Emoji Size
                </p>

                {/* Generated GIF Preview */}
                {downloadUrl && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generated GIF
                    </label>
                    <img
                      src={downloadUrl}
                      alt="Generated GIF"
                      className="w-32 h-32 bg-white rounded shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep text short (2-4 characters) for best visibility</li>
              <li>• Emojis work great! Try mixing text with emoji characters</li>
              <li>• Korean, Japanese, and special characters are supported</li>
              <li>• Generated GIFs are optimized for Slack (128x128px)</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}