'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import GIF from 'gif.js';

type AnimationStyle = 'bounce' | 'spin' | 'rainbow' | 'shake' | 'fade' | 'zoom' | 'pulse' | 'glitch' | 'wave' | 'glow' | 'flip';
type StaticStyle = 'plain' | 'shadow' | 'outline' | 'gradient' | '3d' | 'neon';
type OutputMode = 'animated' | 'static';

export default function StudioPage() {
  const [text, setText] = useState('');
  const [outputMode, setOutputMode] = useState<OutputMode>('animated');
  const [selectedAnimationStyle, setSelectedAnimationStyle] = useState<AnimationStyle>('bounce');
  const [selectedStaticStyle, setSelectedStaticStyle] = useState<StaticStyle>('plain');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#4A154B');
  const [useGradient, setUseGradient] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [useTransparentBg, setUseTransparentBg] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const animationStyles: { id: AnimationStyle; name: string; icon: string }[] = [
    { id: 'bounce', name: 'Bounce', icon: '🏀' },
    { id: 'spin', name: 'Spin', icon: '🔄' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈' },
    { id: 'shake', name: 'Shake', icon: '〰️' },
    { id: 'fade', name: 'Fade', icon: '👻' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' },
    { id: 'pulse', name: 'Pulse', icon: '💗' },
    { id: 'glitch', name: 'Glitch', icon: '📺' },
    { id: 'wave', name: 'Wave', icon: '🌊' },
    { id: 'glow', name: 'Glow', icon: '✨' },
    { id: 'flip', name: 'Flip', icon: '🔃' },
  ];

  const staticStyles: { id: StaticStyle; name: string; icon: string }[] = [
    { id: 'plain', name: 'Plain', icon: '📝' },
    { id: 'shadow', name: 'Shadow', icon: '🌑' },
    { id: 'outline', name: 'Outline', icon: '⭕' },
    { id: 'gradient', name: 'Gradient', icon: '🎨' },
    { id: '3d', name: '3D', icon: '📦' },
    { id: 'neon', name: 'Neon', icon: '💡' },
  ];

  // Helper function to get optimal font size based on text
  const getOptimalFontSize = (text: string, baseSize: number): number => {
    const lines = text.split('\n').filter(line => line.trim());
    const maxLineLength = Math.max(...lines.map(line => line.length), 1);
    const lineCount = lines.length || 1;
    
    // Single character optimization - make it bigger
    if (lineCount === 1 && maxLineLength === 1) {
      return Math.min(baseSize * 2.2, 110);
    }
    
    // For single line, maximize size based on character count
    if (lineCount === 1) {
      if (maxLineLength <= 2) return Math.min(baseSize * 1.5, 90);
      if (maxLineLength <= 3) return Math.min(baseSize * 1.2, 70);
      if (maxLineLength <= 4) return Math.min(baseSize, 60);
      return Math.min(baseSize * (4 / maxLineLength), 50);
    }
    
    // For multiple lines, calculate based on available canvas space
    const canvasHeight = 128;
    const verticalPadding = 10; // Top and bottom padding
    const availableHeight = canvasHeight - verticalPadding;
    
    // Use minimal line spacing
    const minLineSpacing = 4; // Very tight spacing between lines
    const totalSpacing = minLineSpacing * (lineCount - 1);
    
    // Calculate max font size that fits
    const maxFontSize = (availableHeight - totalSpacing) / lineCount;
    
    // Also consider horizontal constraints
    let horizontalLimit = baseSize;
    if (maxLineLength > 4) {
      horizontalLimit = baseSize * (4 / maxLineLength);
    } else if (maxLineLength <= 2) {
      horizontalLimit = baseSize * 1.3;
    }
    
    // Use the smaller of vertical and horizontal limits
    const finalSize = Math.min(maxFontSize, horizontalLimit, baseSize * 1.2);
    
    return Math.max(Math.min(finalSize, 120), 16);
  };
  
  // Helper function to render multi-line text
  const renderMultilineText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    actualFontSize: number,
    color: string | CanvasGradient,
    isGradient: boolean = false
  ) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    // Use tight line spacing for better space utilization
    const lineSpacing = Math.min(actualFontSize * 0.2, 8); // Much tighter spacing
    const lineHeight = actualFontSize + lineSpacing;
    const totalHeight = actualFontSize * lines.length + lineSpacing * (lines.length - 1);
    const startY = y - totalHeight / 2 + actualFontSize / 2;
    
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      
      if (isGradient && typeof color === 'string') {
        const gradient = ctx.createLinearGradient(0, lineY - actualFontSize/2, 128, lineY + actualFontSize/2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }
      
      ctx.fillText(line.trim(), x, lineY);
    });
  };

  const presetColors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Purple', value: '#4A154B' },
    { name: 'Blue', value: '#1264A3' },
    { name: 'Red', value: '#E01E5A' },
    { name: 'Green', value: '#2EB67D' },
    { name: 'Yellow', value: '#FFD700' },
    { name: 'Orange', value: '#FF6B35' },
  ];

  // Preview (animated or static)
  useEffect(() => {
    if (!text || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animationId: number;

    const drawStatic = () => {
      ctx.clearRect(0, 0, 128, 128);
      
      // Draw background if not transparent
      if (!useTransparentBg) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 128, 128);
      }
      
      const optimalSize = getOptimalFontSize(text, fontSize);
      ctx.font = `bold ${optimalSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      switch (selectedStaticStyle) {
        case 'plain':
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
          break;
        
        case 'shadow':
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
          ctx.shadowBlur = 0;
          break;
        
        case 'outline':
          ctx.strokeStyle = textColor;
          ctx.lineWidth = 3;
          ctx.strokeText(text, 64, 64);
          // Fill with contrasting color (white or black based on background)
          ctx.fillStyle = useTransparentBg ? textColor : '#FFFFFF';
          renderMultilineText(ctx, text, 64, 64, optimalSize, useTransparentBg ? textColor : '#FFFFFF', false);
          break;
        
        case 'gradient':
          const gradient = ctx.createLinearGradient(0, 0, 128, 128);
          // Use user's color as base for gradient
          gradient.addColorStop(0, textColor);
          gradient.addColorStop(0.5, useGradient ? '#FFD700' : textColor);
          gradient.addColorStop(1, useGradient ? '#FF6B35' : textColor);
          ctx.fillStyle = gradient;
          renderMultilineText(ctx, text, 64, 64, optimalSize, useTransparentBg ? textColor : '#FFFFFF', false);
          break;
        
        case '3d':
          // 3D effect with multiple layers
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          renderMultilineText(ctx, text, 66, 66, optimalSize, 'rgba(0, 0, 0, 0.3)', false);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          renderMultilineText(ctx, text, 65, 65, optimalSize, 'rgba(0, 0, 0, 0.2)', false);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, 64, optimalSize, useTransparentBg ? textColor : '#FFFFFF', false);
          break;
        
        case 'neon':
          ctx.shadowColor = textColor;
          ctx.shadowBlur = 20;
          ctx.strokeStyle = textColor;
          ctx.lineWidth = 2;
          ctx.strokeText(text, 64, 64);
          ctx.fillStyle = '#FFFFFF';
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
          ctx.shadowBlur = 0;
          break;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, 128, 128);
      
      // Draw background if not transparent
      if (!useTransparentBg) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 128, 128);
      }
      
      const optimalSize = getOptimalFontSize(text, fontSize);
      ctx.font = `bold ${optimalSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Apply animation based on selected style
      switch (selectedAnimationStyle) {
        case 'bounce':
          const bounceY = 64 + Math.sin(frame * 0.15) * 20;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, bounceY, optimalSize, textColor, useGradient);
          break;

        case 'spin':
          ctx.save();
          ctx.translate(64, 64);
          ctx.rotate((frame * 0.1) % (Math.PI * 2));
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;

        case 'rainbow':
          const hue = (frame * 5) % 360;
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          renderMultilineText(ctx, text, 64, 64, optimalSize, useTransparentBg ? textColor : '#FFFFFF', false);
          break;

        case 'shake':
          const shakeX = 64 + Math.sin(frame * 0.5) * 5;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, shakeX, 64, optimalSize, textColor, useGradient);
          break;

        case 'fade':
          const opacity = (Math.sin(frame * 0.1) + 1) / 2;
          ctx.globalAlpha = opacity;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, false);
          ctx.globalAlpha = 1;
          break;

        case 'zoom':
          const scale = 1 + Math.sin(frame * 0.1) * 0.3;
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(scale, scale);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;

        case 'pulse':
          const pulseScale = 1 + Math.sin(frame * 0.2) * 0.2;
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(pulseScale, pulseScale);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;

        case 'glitch':
          // Glitch effect with random offsets
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64 + Math.random() * 4 - 2, 64, optimalSize, textColor, useGradient);
          ctx.globalAlpha = 0.5;
          renderMultilineText(ctx, text, 64 + Math.random() * 4 - 2, 64 + Math.random() * 2 - 1, optimalSize, textColor, useGradient);
          ctx.globalAlpha = 1;
          break;

        case 'wave':
          // Wave effect
          const waveY = 64 + Math.sin(frame * 0.1) * 10 * Math.cos(frame * 0.05);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, waveY, optimalSize, textColor, useGradient);
          break;

        case 'glow':
          // Glow effect with shadow
          const glowIntensity = (Math.sin(frame * 0.1) + 1) * 10;
          ctx.shadowColor = textColor;
          ctx.shadowBlur = glowIntensity;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
          ctx.shadowBlur = 0;
          break;

        case 'flip':
          // Flip effect
          const flipScale = Math.cos(frame * 0.1);
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(flipScale, 1);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;
      }

      frame++;
      animationFrameRef.current = frame;
      animationId = requestAnimationFrame(animate);
    };

    // Run appropriate preview based on mode
    if (outputMode === 'static') {
      drawStatic();
    } else {
      animate();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [text, selectedAnimationStyle, selectedStaticStyle, fontSize, outputMode, textColor, useGradient, backgroundColor, useTransparentBg]);

  const generateGIF = async () => {
    if (!text || !canvasRef.current) return;

    setIsGenerating(true);
    setDownloadUrl(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create GIF encoder
    // Note: GIF format doesn't support true transparency, only single-color transparency
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
      
      // Always draw a background for GIF (transparency doesn't work well)
      ctx.fillStyle = useTransparentBg ? '#FFFFFF' : backgroundColor;
      ctx.fillRect(0, 0, 128, 128);
      
      const optimalSize = getOptimalFontSize(text, fontSize);
      ctx.font = `bold ${optimalSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Apply animation
      switch (selectedAnimationStyle) {
        case 'bounce':
          const bounceY = 64 + Math.sin(frame * 0.3) * 20;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, bounceY, optimalSize, textColor, useGradient);
          break;

        case 'spin':
          ctx.save();
          ctx.translate(64, 64);
          ctx.rotate((frame * 0.3) % (Math.PI * 2));
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;

        case 'rainbow':
          const hue = (frame * 18) % 360;
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          renderMultilineText(ctx, text, 64, 64, optimalSize, useTransparentBg ? textColor : '#FFFFFF', false);
          break;

        case 'shake':
          const shakeX = 64 + Math.sin(frame * 1.5) * 5;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, shakeX, 64, optimalSize, textColor, useGradient);
          break;

        case 'fade':
          const opacity = (Math.sin(frame * 0.3) + 1) / 2;
          ctx.globalAlpha = opacity;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, false);
          ctx.globalAlpha = 1;
          break;

        case 'zoom':
          const scale = 1 + Math.sin(frame * 0.3) * 0.3;
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(scale, scale);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;

        case 'pulse':
          const pulseScale = 1 + Math.sin(frame * 0.4) * 0.2;
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(pulseScale, pulseScale);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
          ctx.restore();
          break;

        case 'glitch':
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64 + (frame % 10 < 5 ? 2 : -2), 64, optimalSize, textColor, useGradient);
          ctx.globalAlpha = 0.5;
          renderMultilineText(ctx, text, 64 + (frame % 10 < 5 ? -2 : 2), 64 + 1, optimalSize, textColor, useGradient);
          ctx.globalAlpha = 1;
          break;

        case 'wave':
          const waveY = 64 + Math.sin(frame * 0.3) * 10 * Math.cos(frame * 0.15);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, waveY, optimalSize, textColor, useGradient);
          break;

        case 'glow':
          const glowIntensity = (Math.sin(frame * 0.3) + 1) * 10;
          ctx.shadowColor = textColor;
          ctx.shadowBlur = glowIntensity;
          if (useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 128, 128);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
          ctx.shadowBlur = 0;
          break;

        case 'flip':
          const flipScale = Math.cos(frame * 0.3);
          ctx.save();
          ctx.translate(64, 64);
          ctx.scale(flipScale, 1);
          if (useGradient) {
            const gradient = ctx.createLinearGradient(-64, -64, 64, 64);
            gradient.addColorStop(0, textColor);
            gradient.addColorStop(1, '#FFD700');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = textColor;
          }
          renderMultilineText(ctx, text, 0, 0, optimalSize, textColor, useGradient);
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

  const generatePNG = () => {
    if (!text || !canvasRef.current) return;

    setIsGenerating(true);
    setDownloadUrl(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the static style one more time
    ctx.clearRect(0, 0, 128, 128);
    
    // Draw background if not transparent
    if (!useTransparentBg) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 128, 128);
    }
    
    const optimalSize = getOptimalFontSize(text, fontSize);
    ctx.font = `bold ${optimalSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (selectedStaticStyle) {
      case 'plain':
        if (useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, 128, 128);
          gradient.addColorStop(0, textColor);
          gradient.addColorStop(1, '#FFD700');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = textColor;
        }
        renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
        break;
      
      case 'shadow':
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        if (useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, 128, 128);
          gradient.addColorStop(0, textColor);
          gradient.addColorStop(1, '#FFD700');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = textColor;
        }
        renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
        ctx.shadowBlur = 0;
        break;
      
      case 'outline':
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 3;
        ctx.strokeText(text, 64, 64);
        // Fill with contrasting color (white or black based on background)
        ctx.fillStyle = useTransparentBg ? textColor : '#FFFFFF';
        renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
        break;
      
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        // Use user's color as base for gradient
        gradient.addColorStop(0, textColor);
        gradient.addColorStop(0.5, useGradient ? '#FFD700' : textColor);
        gradient.addColorStop(1, useGradient ? '#FF6B35' : textColor);
        ctx.fillStyle = gradient;
        renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
        break;
      
      case '3d':
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        renderMultilineText(ctx, text, 66, 66, optimalSize, 'rgba(0, 0, 0, 0.3)', false);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        renderMultilineText(ctx, text, 65, 65, optimalSize, 'rgba(0, 0, 0, 0.2)', false);
        if (useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, 128, 128);
          gradient.addColorStop(0, textColor);
          gradient.addColorStop(1, '#FFD700');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = textColor;
        }
        renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
        break;
      
      case 'neon':
        ctx.shadowColor = textColor;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.strokeText(text, 64, 64);
        ctx.fillStyle = '#FFFFFF';
        renderMultilineText(ctx, text, 64, 64, optimalSize, textColor, useGradient);
        ctx.shadowBlur = 0;
        break;
    }

    // Convert canvas to PNG
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsGenerating(false);
      }
    }, 'image/png');
  };

  const downloadFile = () => {
    if (!downloadUrl) return;

    const a = document.createElement('a');
    a.href = downloadUrl;
    const extension = outputMode === 'animated' ? 'gif' : 'png';
    const styleName = outputMode === 'animated' ? selectedAnimationStyle : selectedStaticStyle;
    a.download = `${text.replace(/\s+/g, '_')}_${styleName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-4 pb-6 md:pb-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Link 
            href="/" 
            className="text-slack-purple/70 hover:text-slack-purple text-2xl transition-all hover:scale-110 hover:-translate-x-1"
            style={{
              animation: 'float-left 3s ease-in-out infinite'
            }}
          >
            ←
          </Link>
          <Link 
            href="/packs" 
            className="text-slack-purple/70 hover:text-slack-purple text-2xl transition-all hover:scale-110 hover:translate-x-1"
            style={{
              animation: 'float-right 3s ease-in-out infinite'
            }}
          >
            →
          </Link>
        </div>
        <style jsx>{`
          @keyframes float-left {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-3px); }
          }
          @keyframes float-right {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(3px); }
          }
        `}</style>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Create Custom Emoji</h2>
            <p className="text-sm md:text-base text-gray-600">
              Type your text, choose a style, and generate an animated GIF emoji
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Left: Controls */}
              <div className="space-y-6">
                {/* Mode Selection Tabs */}
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => {
                      setOutputMode('animated');
                      // GIF doesn't support transparency, so disable it
                      setUseTransparentBg(false);
                    }}
                    className={`flex-1 py-2 px-2 md:px-4 rounded-md font-medium text-sm md:text-base transition-all ${
                      outputMode === 'animated'
                        ? 'bg-white text-slack-purple shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="hidden sm:inline">🎬 </span>Animated GIF
                  </button>
                  <button
                    onClick={() => setOutputMode('static')}
                    className={`flex-1 py-2 px-2 md:px-4 rounded-md font-medium text-sm md:text-base transition-all ${
                      outputMode === 'static'
                        ? 'bg-white text-slack-purple shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="hidden sm:inline">🖼️ </span>Static PNG
                  </button>
                </div>

                {/* Step 1: Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Enter Your Text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      // Limit to 3 lines and 6 characters per line
                      const limitedLines = lines.slice(0, 3).map(line => line.slice(0, 6));
                      setText(limitedLines.join('\n'));
                    }}
                    placeholder="Type here... (Enter for new line)&#10;예: 대박&#10;    진짜"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slack-purple focus:border-transparent resize-none font-mono"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {text.split('\n').filter(l => l).length} lines, {text.replace(/\n/g, '').length} total chars
                  </p>
                </div>

                {/* Step 2: Text Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Adjust Text Size
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="16"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-center">
                      {fontSize}px
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                    <span>Extra Large</span>
                  </div>
                </div>

                {/* Step 3: Choose Colors */}
                <div className="space-y-4">
                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3. Text Color
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-4 gap-2 mb-3">
                      {presetColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setTextColor(color.value)}
                          className={`h-10 md:h-12 rounded-lg border-2 transition-all ${
                            textColor === color.value
                              ? 'border-slack-purple shadow-lg scale-110'
                              : 'border-gray-300 hover:border-slack-purple'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 sm:w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm md:text-base"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={useGradient}
                          onChange={(e) => setUseGradient(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Gradient</span>
                      </label>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4. Background
                    </label>
                    <div className="mb-3">
                      {/* Only show transparent option for PNG (static) mode */}
                      {outputMode === 'static' && (
                        <label className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={useTransparentBg}
                            onChange={(e) => setUseTransparentBg(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Transparent Background</span>
                        </label>
                      )}
                      {(!useTransparentBg || outputMode === 'animated') && (
                        <>
                          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-4 gap-2 mb-3">
                            {presetColors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setBackgroundColor(color.value)}
                                className={`h-10 md:h-12 rounded-lg border-2 transition-all ${
                                  backgroundColor === color.value
                                    ? 'border-slack-purple shadow-lg scale-110'
                                    : 'border-gray-300 hover:border-slack-purple'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-10 h-10 md:w-12 md:h-12 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              placeholder="#FFFFFF"
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm md:text-base"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 5: Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    5. Choose {outputMode === 'animated' ? 'Animation' : 'Static'} Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {outputMode === 'animated' ? (
                      animationStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedAnimationStyle(style.id)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedAnimationStyle === style.id
                              ? 'border-slack-purple bg-slack-purple text-white'
                              : 'border-gray-300 hover:border-slack-purple'
                          }`}
                        >
                          <span className="block text-2xl mb-1">{style.icon}</span>
                          <span className="text-sm">{style.name}</span>
                        </button>
                      ))
                    ) : (
                      staticStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStaticStyle(style.id)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedStaticStyle === style.id
                              ? 'border-slack-purple bg-slack-purple text-white'
                              : 'border-gray-300 hover:border-slack-purple'
                          }`}
                        >
                          <span className="block text-2xl mb-1">{style.icon}</span>
                          <span className="text-sm">{style.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Step 5: Generate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    5. Generate {outputMode === 'animated' ? 'GIF' : 'PNG'}
                  </label>
                  <button
                    onClick={outputMode === 'animated' ? generateGIF : generatePNG}
                    disabled={!text || isGenerating}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      !text || isGenerating
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-slack-purple text-white hover:bg-opacity-90'
                    }`}
                  >
                    {isGenerating ? 'Generating...' : `Generate ${outputMode === 'animated' ? 'GIF' : 'PNG'}`}
                  </button>
                </div>

                {/* Download Button */}
                {downloadUrl && (
                  <button
                    onClick={downloadFile}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    📥 Download {outputMode === 'animated' ? 'GIF' : 'PNG'}
                  </button>
                )}
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Live Preview
                </label>
                <div className="bg-gray-100 rounded-lg p-8">
                  <div 
                    className="inline-block rounded"
                    style={{
                      backgroundImage: `linear-gradient(45deg, #e0e0e0 25%, transparent 25%), 
                                      linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), 
                                      linear-gradient(45deg, transparent 75%, #e0e0e0 75%), 
                                      linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)`,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={128}
                      height={128}
                      className="block rounded shadow-md"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  128x128px - Slack Emoji Size
                </p>

                {/* Generated File Preview */}
                {downloadUrl && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generated {outputMode === 'animated' ? 'GIF' : 'PNG'}
                    </label>
                    <img
                      src={downloadUrl}
                      alt={`Generated ${outputMode === 'animated' ? 'GIF' : 'PNG'}`}
                      className="w-32 h-32 bg-white rounded shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 md:mt-8 bg-blue-50 rounded-lg p-4 md:p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
            <ul className="text-xs md:text-sm text-blue-800 space-y-1">
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