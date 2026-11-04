'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  SquadSocketClient,
  SquadRoomData,
  SquadMember,
  SquadActivity,
  SquadTimer,
  HypeReaction,
} from './squadSocketService';
import './squad-rooms.css';

// Sound effects synthesizer via Web Audio API (zero external assets needed)
class SoundFX {
  private ctx: AudioContext | null = null;

  private getCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playTimerComplete() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.18, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.45);
    });
  }

  public playBeep(freq = 600) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  public playHypePop() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }
}

interface FloatingEmojiItem {
  id: string;
  emoji: string;
  xPercent: number;
}

const PRESET_ROOMS = [
  { id: 'room-push-beasts', name: 'Heavy Push Syndicate 🔥', split: 'Chest, Shoulders & Triceps' },
  { id: 'room-leg-day-cult', name: 'Leg Day Survivors 💀', split: 'Quads, Hamstrings & Calves' },
  { id: 'room-hypertrophy-lab', name: 'Hypertrophy Lab 🧬', split: 'Full Body / Upper Hypertrophy' },
];

export default function SquadRoomsPage() {
  const [userName, setUserName] = useState<string>('Lifter');
  const [userAvatar] = useState<string>('⚡');
  const [currentRoomId, setCurrentRoomId] = useState<string>('room-push-beasts');
  const [roomData, setRoomData] = useState<SquadRoomData | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Synced Timer State
  const [timer, setTimer] = useState<SquadTimer>({
    active: false,
    secondsLeft: 0,
    totalSeconds: 90,
    startedBy: null,
  });

  // Floating Reactions
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmojiItem[]>([]);

  // Log Set Inputs
  const [exerciseInput, setExerciseInput] = useState<string>('Barbell Bench Press');
  const [weightInput, setWeightInput] = useState<number>(80);
  const [repsInput, setRepsInput] = useState<number>(10);
  const [unitInput, setUnitInput] = useState<string>('kg');
  const [myStatus, setMyStatus] = useState<'LIFTING' | 'RESTING' | 'HYDRATING'>('LIFTING');

  // Chat message input
  const [chatText, setChatText] = useState<string>('');

  // Room modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customRoomName, setCustomRoomName] = useState<string>('');
  const [customRoomSplit, setCustomRoomSplit] = useState<string>('Push / Pull');

  const clientRef = useRef<SquadSocketClient | null>(null);
  const soundRef = useRef<SoundFX | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize sound player
  useEffect(() => {
    soundRef.current = new SoundFX();
  }, []);

  // Determine user identity from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) setUserName(parsed.name);
        }
      } catch {
        // Fallback default
      }
    }
  }, []);

  // Connect to room via SquadSocketClient
  useEffect(() => {
    const client = new SquadSocketClient({
      onRoomSync: (room, yourMemberId) => {
        setRoomData(room);
        setMyId(yourMemberId);
        setTimer(room.timer);
      },
      onTimerState: (newTimer) => {
        setTimer(newTimer);
      },
      onTimerTick: (secondsLeft) => {
        setTimer((prev) => ({ ...prev, secondsLeft }));
        if (secondsLeft <= 3 && secondsLeft > 0) {
          soundRef.current?.playBeep(440);
        }
      },
      onTimerExpired: (expiredTimer) => {
        setTimer(expiredTimer);
        soundRef.current?.playTimerComplete();
      },
      onMemberJoined: (member, activity) => {
        setRoomData((prev) => {
          if (!prev) return prev;
          const filtered = prev.members.filter((m) => m.id !== member.id);
          const hasActivity = activity && prev.activities.some((a) => a.id === activity.id);
          return {
            ...prev,
            members: [...filtered, member],
            activities: activity && !hasActivity ? [...prev.activities, activity] : prev.activities,
          };
        });
      },
      onMemberUpdated: (member) => {
        setRoomData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            members: prev.members.map((m) => (m.id === member.id ? member : m)),
          };
        });
      },
      onMemberLeft: (memberId, activity) => {
        setRoomData((prev) => {
          if (!prev) return prev;
          const hasActivity = activity && prev.activities.some((a) => a.id === activity.id);
          return {
            ...prev,
            members: prev.members.filter((m) => m.id !== memberId),
            activities: activity && !hasActivity ? [...prev.activities, activity] : prev.activities,
          };
        });
      },
      onActivityLog: (activity) => {
        setRoomData((prev) => {
          if (!prev) return prev;
          if (activity && prev.activities.some((a) => a.id === activity.id)) return prev;
          return {
            ...prev,
            activities: [...prev.activities, activity],
          };
        });
      },
      onHypeReaction: (reaction: HypeReaction) => {
        soundRef.current?.playHypePop();
        const newEmoji: FloatingEmojiItem = {
          id: reaction.id,
          emoji: reaction.emoji,
          xPercent: 15 + Math.random() * 70,
        };
        setFloatingEmojis((prev) => [...prev.slice(-15), newEmoji]);

        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((item) => item.id !== newEmoji.id));
        }, 2400);
      },
      onConnectionChange: (connected, demo) => {
        setIsConnected(connected);
        setIsDemoMode(demo);
      },
    });

    clientRef.current = client;
    client.connect(currentRoomId, userName, userAvatar);

    return () => {
      client.disconnect();
    };
  }, [currentRoomId, userName, userAvatar]);

  // Scroll activity feed to bottom on new item
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomData?.activities?.length]);

  // Rest Timer SVG ring calculation
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const timerPercentage = useMemo(() => {
    if (!timer.active || timer.totalSeconds <= 0) return 0;
    return Math.max(0, Math.min(1, timer.secondsLeft / timer.totalSeconds));
  }, [timer]);
  const strokeDashoffset = circumference - timerPercentage * circumference;

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handlers
  const handleStartTimer = (secs: number) => {
    clientRef.current?.startTimer(secs);
  };

  const handleAdjustTimer = (delta: number) => {
    clientRef.current?.adjustTimer(delta);
  };

  const handleStopTimer = () => {
    clientRef.current?.stopTimer();
  };

  const handleStatusChange = (status: 'LIFTING' | 'RESTING' | 'HYDRATING') => {
    setMyStatus(status);
    clientRef.current?.updateStatus(status, exerciseInput);
  };

  const handleLogSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseInput.trim() || weightInput <= 0 || repsInput <= 0) return;
    clientRef.current?.logSet(exerciseInput, weightInput, repsInput, unitInput, 90);
    setMyStatus('RESTING');
  };

  const handleSendHype = (emoji: string) => {
    clientRef.current?.sendHypeReaction(emoji);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    clientRef.current?.sendChat(chatText);
    setChatText('');
  };

  const handleSwitchRoom = (id: string) => {
    setCurrentRoomId(id);
    setIsModalOpen(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomName.trim()) return;
    const newId = `room-${customRoomName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    setCurrentRoomId(newId);
    setIsModalOpen(false);
    setCustomRoomName('');
  };

  return (
    <div className="squad-container">
      {/* Floating Emoji Particles Layer */}
      <div className="floating-emoji-container">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="floating-emoji"
            style={{ left: `${item.xPercent}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <div className="squad-wrapper">
        {/* Header */}
        <div className="squad-header">
          <div className="squad-title-area">
            <h1>
              <span>⚡</span> Multiplayer Workout Squad
            </h1>
            <p className="squad-subtitle">
              Train concurrently with your lifting squad across real-time WebSockets.
              Synchronize rest timers, track live set telemetry, and fuel the grind with instant hype reactions.
            </p>
          </div>

          <div className="squad-status-pill">
            <span
              className={`status-dot ${
                isConnected ? (isDemoMode ? 'demo' : 'online') : 'disconnected'
              }`}
            />
            <span>
              {isConnected
                ? isDemoMode
                  ? 'AI Gym Buddies Active'
                  : 'Connected to Live Server'
                : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Room Navigation Ribbon */}
        <div className="room-ribbon">
          <div className="room-identity">
            <div className="room-badge-icon">🏛️</div>
            <div>
              <div className="room-name-text">
                {roomData?.name || 'Heavy Push Syndicate 🔥'}
              </div>
              <span className="room-split-tag">
                {roomData?.split || 'Chest & Triceps Focus'}
              </span>
            </div>
          </div>

          <div className="room-switch-actions">
            <button
              className="squad-btn-secondary"
              onClick={() => setIsModalOpen(true)}
            >
              🔄 Switch / Create Room
            </button>
            <Link href="/" className="squad-btn-secondary">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="squad-main-grid">
          {/* Left Column: Timer, Quick Log, Members */}
          <div className="squad-left-col">
            {/* Master Rest Timer Card */}
            <div className="squad-timer-card">
              <div className="timer-card-glow" />

              <div className="timer-card-header">
                <div className="timer-card-title">
                  <span>⏱️</span> Squad Rest Cadence
                </div>
                {timer.active && timer.startedBy && (
                  <div className="timer-starter-badge">
                    Started by {timer.startedBy}
                  </div>
                )}
              </div>

              {/* Circular Dial */}
              <div className="timer-dial-container">
                <div className="timer-svg-wrap">
                  <svg width="240" height="240" viewBox="0 0 240 240">
                    <circle
                      className="timer-ring-bg"
                      cx="120"
                      cy="120"
                      r={radius}
                    />
                    <circle
                      className={`timer-ring-progress ${
                        timer.secondsLeft > 0 && timer.secondsLeft <= 10 ? 'urgent' : ''
                      }`}
                      cx="120"
                      cy="120"
                      r={radius}
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: timer.active ? strokeDashoffset : circumference,
                      }}
                    />
                  </svg>
                  <div className="timer-center-text">
                    <div className="timer-numbers">
                      {timer.active ? formatTime(timer.secondsLeft) : '0:00'}
                    </div>
                    <div
                      className={`timer-label ${timer.active ? 'active' : ''}`}
                    >
                      {timer.active ? 'RESTING' : 'READY TO LIFT'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              {timer.active ? (
                <div className="timer-controls-row">
                  <button
                    className="btn-timer-adjust"
                    onClick={() => handleAdjustTimer(-15)}
                  >
                    -15s
                  </button>
                  <button
                    className="btn-timer-adjust"
                    onClick={() => handleAdjustTimer(+15)}
                  >
                    +15s
                  </button>
                  <button className="btn-timer-skip" onClick={handleStopTimer}>
                    Skip Rest ⚡
                  </button>
                </div>
              ) : (
                <div className="timer-presets">
                  <button
                    className="preset-chip"
                    onClick={() => handleStartTimer(60)}
                  >
                    Start 60s
                  </button>
                  <button
                    className="preset-chip"
                    onClick={() => handleStartTimer(90)}
                  >
                    Start 90s (Hypertrophy)
                  </button>
                  <button
                    className="preset-chip"
                    onClick={() => handleStartTimer(120)}
                  >
                    Start 120s (Strength)
                  </button>
                  <button
                    className="preset-chip"
                    onClick={() => handleStartTimer(180)}
                  >
                    Start 180s (Power)
                  </button>
                </div>
              )}
            </div>

            {/* Quick Set Logger */}
            <div className="squad-logger-card">
              <div className="logger-card-title">
                <span>📝 Log Set & Broadcast Rest</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Auto-syncs room timer to 90s
                </span>
              </div>

              {/* Status Selector */}
              <div className="status-toggle-group">
                <button
                  type="button"
                  className={`btn-status-toggle lifting ${
                    myStatus === 'LIFTING' ? 'active' : ''
                  }`}
                  onClick={() => handleStatusChange('LIFTING')}
                >
                  🔥 Lifting
                </button>
                <button
                  type="button"
                  className={`btn-status-toggle resting ${
                    myStatus === 'RESTING' ? 'active' : ''
                  }`}
                  onClick={() => handleStatusChange('RESTING')}
                >
                  ⏱️ Resting
                </button>
                <button
                  type="button"
                  className={`btn-status-toggle hydrating ${
                    myStatus === 'HYDRATING' ? 'active' : ''
                  }`}
                  onClick={() => handleStatusChange('HYDRATING')}
                >
                  💧 Hydrating
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleLogSet} className="logger-form-row">
                <input
                  type="text"
                  className="squad-input"
                  placeholder="Exercise name"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                />
                <input
                  type="number"
                  className="squad-input"
                  placeholder="Weight (kg)"
                  value={weightInput || ''}
                  onChange={(e) => setWeightInput(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="squad-input"
                  placeholder="Reps"
                  value={repsInput || ''}
                  onChange={(e) => setRepsInput(Number(e.target.value))}
                />
                <button type="submit" className="btn-log-set">
                  Log & Sync ⏱️
                </button>
              </form>
            </div>

            {/* Squad Members Roster */}
            <div className="roster-header">
              <div className="roster-title">
                Squad Members ({roomData?.members?.length || 0})
              </div>
            </div>

            <div className="members-grid">
              {roomData?.members?.map((member) => {
                const isYou = member.id === myId;
                return (
                  <div
                    key={member.id}
                    className={`member-card ${isYou ? 'is-you' : ''}`}
                  >
                    <div className="member-card-top">
                      <div className="member-info-left">
                        <div className="member-avatar">{member.avatar}</div>
                        <div>
                          <div className="member-name">
                            {member.name}
                            {isYou && <span className="badge-you">You</span>}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`member-status-tag status-${member.status.toLowerCase()}`}
                      >
                        {member.status}
                      </span>
                    </div>

                    <div className="member-exercise-label">Current Exercise</div>
                    <div className="member-exercise-val">
                      {member.currentExercise || 'Getting Ready'}
                    </div>

                    {member.lastSet ? (
                      <div className="member-last-set-box">
                        <span>📊 Last Set:</span>
                        <strong>
                          {member.lastSet.weight}
                          {member.lastSet.unit} × {member.lastSet.reps} reps
                        </strong>
                      </div>
                    ) : (
                      <div
                        className="member-last-set-box"
                        style={{ color: '#64748b' }}
                      >
                        Warming up for set 1...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Reactions & Live Stream Feed */}
          <div className="squad-sidebar">
            {/* Hype Reaction Pad */}
            <div className="hype-pad-card">
              <div className="hype-pad-title">
                <span>🔥 Hype Reaction Pad</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                  Tap to cheer squad
                </span>
              </div>
              <div className="hype-buttons-grid">
                {['🔥', '💪', '⚡', '👏', '🦾', '🚀'].map((emoji) => (
                  <button
                    key={emoji}
                    className="btn-hype"
                    onClick={() => handleSendHype(emoji)}
                    title={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Squad Activity Feed */}
            <div className="squad-feed-card">
              <div className="feed-header">
                <span>⚡ Live Squad Stream</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Real-time updates
                </span>
              </div>

              <div className="feed-stream">
                {roomData?.activities?.map((act, idx) => {
                  const timeStr = new Date(act.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div key={`${act.id || 'act'}-${idx}`} className={`feed-item ${act.type}`}>
                      <span className="feed-time">{timeStr}</span>
                      <span className="feed-sender">{act.sender}:</span>
                      <span className="feed-text">{act.text}</span>
                    </div>
                  );
                })}
                <div ref={feedEndRef} />
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendChat} className="feed-chat-input-row">
                <input
                  type="text"
                  className="squad-input"
                  placeholder="Drop a cheer or message..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                />
                <button
                  type="submit"
                  className="squad-btn-primary"
                  style={{ padding: '0.55rem 0.9rem' }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Switch / Create Room Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Squad Workout Rooms</div>
              <button
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Select an active public room or create a custom workout room for your training partners:
            </p>

            <div className="modal-room-list">
              {PRESET_ROOMS.map((r) => (
                <div
                  key={r.id}
                  className="modal-room-card"
                  onClick={() => handleSwitchRoom(r.id)}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#10b981' }}>
                      {r.split}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                    Join →
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1rem',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.75rem',
                  color: '#ffffff',
                }}
              >
                Create Custom Room
              </div>
              <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="squad-input"
                  placeholder="Room Name (e.g., Dawn Shredders)"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                />
                <input
                  type="text"
                  className="squad-input"
                  placeholder="Target Split (e.g., Pull & Deadlifts)"
                  value={customRoomSplit}
                  onChange={(e) => setCustomRoomSplit(e.target.value)}
                />
                <button type="submit" className="squad-btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Create & Enter Squad Room
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

