import React, { useRef, useState, useEffect } from 'react';
import { Recording } from '../types';
import { Play, Pause, Volume2, VolumeX, Download, X, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  recording: Recording | null;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ recording, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recording && audioRef.current) {
      setIsLoading(true);
      setError(null);
      setCurrentTime(0);
      setDuration(0);
      
      audioRef.current.src = recording.FilePath;
      audioRef.current.load();
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(e => {
          console.error("Auto-play failed", e);
          setIsPlaying(false);
          setIsLoading(false);
          // Auto-play might be blocked, but that's okay
        });
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(false);
      setError(null);
    }
  }, [recording]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !Number.isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Failed to load audio file');
    setIsLoading(false);
    setIsPlaying(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (!recording) return;
    const link = document.createElement('a');
    link.href = recording.FilePath;
    link.target = '_blank';
    link.download = `recording-${recording.RecordingID}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!recording) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-5 duration-300">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        preload="metadata"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Info Section */}
          <div className="flex items-center w-full sm:w-1/4 space-x-3 overflow-hidden">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 flex-shrink-0">
               <Volume2 size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate" title={recording.FirstParticipant}>
                {recording.FirstParticipant}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {recording.RecordingID} • {recording.Direction}
              </p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col items-center w-full sm:w-2/4 space-y-1">
            {error ? (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={togglePlay}
                    disabled={isLoading || !!error}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                  </button>
                  {isLoading && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </div>
                
                <div className="w-full flex items-center space-x-3 text-xs text-gray-500 font-medium">
                  <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                  <div className="flex-grow relative">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      disabled={isLoading || !!error}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(currentTime / (duration || 100)) * 100}%, #e5e7eb ${(currentTime / (duration || 100)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <span className="w-10 tabular-nums">{formatTime(duration)}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-end w-full sm:w-1/4 space-x-3">
            <button onClick={toggleMute} className="text-gray-400 hover:text-gray-600 transition-colors">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
              title="Download Recording"
            >
              <Download size={18} />
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;