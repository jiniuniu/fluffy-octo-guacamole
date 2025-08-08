// components/AudioPlayer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Download, Loader2 } from "lucide-react";
import { GenerationRecord } from "@/lib/types";

interface AudioPlayerProps {
  record: GenerationRecord;
  className?: string;
}

export function AudioPlayer({ record, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    // 如果没有音频URL或音频元素，直接返回
    if (!audio || !record.audio_url) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const handleError = () => {
      setIsLoading(false);
      setError("音频加载失败");
      setIsPlaying(false);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [record.audio_url]);

  // 如果没有音频URL，不渲染播放器
  if (!record.audio_url) {
    return null;
  }

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("播放失败");
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = record.audio_url!;
    link.download = `physics_audio_${record.id}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getVoiceTypeDisplay = () => {
    const voiceType = record.audio_metadata?.voice_type;
    const voiceNames: Record<string, string> = {
      Cherry: "甜美女声",
      Chelsie: "标准女声",
      Ethan: "标准男声",
      Serena: "优雅女声",
      Dylan: "京腔男声",
      Jada: "吴语女声",
      Sunny: "川音女声",
    };
    return voiceNames[voiceType || ""] || voiceType || "未知";
  };

  return (
    <div className={`w-full ${className}`}>
      <audio ref={audioRef} src={record.audio_url} preload="metadata" />

      {/* 播放器容器 - 半透明背景 */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
        {error ? (
          <div className="text-center text-red-600 text-sm py-2">
            🔇 {error}
          </div>
        ) : (
          <div className="space-y-2">
            {/* 主控制行 */}
            <div className="flex items-center gap-3">
              {/* 播放/暂停按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                disabled={isLoading}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* 进度条 */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-gray-600 font-mono">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-600 font-mono">
                  {formatTime(duration)}
                </span>
              </div>

              {/* 音量控制 */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-6 w-6 p-0"
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 下载按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 w-6 p-0"
                title="下载音频"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>

            {/* 音频信息行 */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                🎤 {getVoiceTypeDisplay()}
              </span>
              {record.audio_metadata && (
                <span>
                  {Math.round(record.audio_metadata.file_size / 1024)}KB
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
