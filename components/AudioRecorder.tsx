import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, FileAudio } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  existingAudioUrl?: string;
}

type RecordingMode = 'record' | 'upload';

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, existingAudioUrl }) => {
  const [mode, setMode] = useState<RecordingMode>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl && !existingAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl && !existingAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm|m4a)$/i)) {
      alert('Please upload a valid audio file (MP3, WAV, OGG, WebM, or M4A)');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    // Create blob and URL
    const blob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(blob);
    
    setAudioUrl(url);
    setFileName(file.name);
    onRecordingComplete(blob);

    // Get audio duration
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setRecordingTime(Math.floor(audio.duration));
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleModeChange = (newMode: RecordingMode) => {
    // Clear any existing recording when switching modes
    if (audioUrl) {
      deleteRecording();
    }
    setMode(newMode);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => handleModeChange('record')}
          className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            mode === 'record'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mic size={18} />
          <span>Record Audio</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('upload')}
          className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            mode === 'upload'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileAudio size={18} />
          <span>Upload File</span>
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        {!audioUrl ? (
          <>
            {/* Record Mode */}
            {mode === 'record' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                      <Mic size={20} />
                      <span className="font-medium">Start Recording</span>
                    </button>
                  ) : (
                    <>
                      {!isPaused ? (
                        <button
                          type="button"
                          onClick={pauseRecording}
                          className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-md"
                        >
                          <Pause size={20} />
                          <span className="font-medium">Pause</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resumeRecording}
                          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                          <Play size={20} />
                          <span className="font-medium">Resume</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                      >
                        <Square size={20} />
                        <span className="font-medium">Stop</span>
                      </button>
                    </>
                  )}
                </div>
                
                {isRecording && (
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <span className="text-lg font-mono font-bold text-gray-700">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div className="flex flex-col items-center space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <Upload size={20} />
                  <span className="font-medium">Choose Audio File</span>
                </button>
                <p className="text-sm text-gray-500 text-center">
                  Supported formats: MP3, WAV, OGG, WebM, M4A<br />
                  Maximum file size: 50MB
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {mode === 'upload' && fileName ? fileName : 'Recording ready'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Duration: {formatTime(recordingTime)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={deleteRecording}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete and choose another"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
            />
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 flex items-start space-x-1">
        {mode === 'record' ? (
          <>
            <Mic size={12} className="mt-0.5" />
            <span>
              Record audio using your microphone. Click "Start Recording" to begin. The recording will be uploaded to S3 when you submit the form.
            </span>
          </>
        ) : (
          <>
            <Upload size={12} className="mt-0.5" />
            <span>
              Upload an existing audio file from your device. Supported formats: MP3, WAV, OGG, WebM, M4A. The file will be uploaded to S3 when you submit the form.
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;

