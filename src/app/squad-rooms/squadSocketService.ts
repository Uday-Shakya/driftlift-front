// driftlift-front/src/app/squad-rooms/squadSocketService.ts

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  currentExercise: string;
  status: 'LIFTING' | 'RESTING' | 'HYDRATING' | 'IDLE';
  lastSet: {
    exercise: string;
    weight: number;
    reps: number;
    unit: string;
    timestamp: number;
  } | null;
  weightUnit?: string;
}

export interface SquadTimer {
  active: boolean;
  secondsLeft: number;
  totalSeconds: number;
  startedBy: string | null;
}

export interface SquadActivity {
  id: string;
  sender: string;
  text: string;
  type: 'SYSTEM' | 'TIMER' | 'SET_LOGGED' | 'JOIN' | 'LEAVE' | 'CHAT';
  timestamp: number;
}

export interface SquadRoomData {
  id: string;
  name: string;
  split: string;
  description: string;
  memberCount: number;
  members: SquadMember[];
  timer: SquadTimer;
  activities: SquadActivity[];
}

export interface HypeReaction {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  timestamp: number;
}

function generateActivityId(): string {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type SquadEventHandler = {
  onRoomSync?: (room: SquadRoomData, yourMemberId: string) => void;
  onTimerState?: (timer: SquadTimer) => void;
  onTimerTick?: (secondsLeft: number) => void;
  onTimerExpired?: (timer: SquadTimer) => void;
  onMemberUpdated?: (member: SquadMember) => void;
  onMemberJoined?: (member: SquadMember, activity: SquadActivity) => void;
  onMemberLeft?: (memberId: string, activity: SquadActivity) => void;
  onActivityLog?: (activity: SquadActivity) => void;
  onHypeReaction?: (reaction: HypeReaction) => void;
  onConnectionChange?: (connected: boolean, isDemoMode: boolean) => void;
};

export class SquadSocketClient {
  private ws: WebSocket | null = null;
  private handlers: SquadEventHandler = {};
  private currentRoom: SquadRoomData | null = null;
  private yourId: string = '';
  private isDemoMode: boolean = false;
  private demoTimerInterval: ReturnType<typeof setInterval> | null = null;
  private demoBotInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect: boolean = true;
  private lastParams: { roomId: string; name: string; avatar: string } | null = null;

  constructor(handlers: SquadEventHandler = {}) {
    this.handlers = handlers;
  }

  public setHandlers(handlers: SquadEventHandler) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  public connect(roomId: string, name: string, avatar: string = '⚡') {
    this.lastParams = { roomId, name, avatar };
    this.shouldReconnect = true;
    this.cleanupDemo();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';
    let wsUrl = backendUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    wsUrl += `/squad-ws?roomId=${encodeURIComponent(roomId)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isDemoMode = false;
        this.handlers.onConnectionChange?.(true, false);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleIncomingMessage(msg);
        } catch (e) {
          console.error('Failed to parse WS squad message:', e);
        }
      };

      this.ws.onerror = () => {
        // Fall back to interactive local demo mode seamlessly
        if (!this.currentRoom) {
          this.startDemoMode(roomId, name, avatar);
        }
      };

      this.ws.onclose = () => {
        this.handlers.onConnectionChange?.(false, this.isDemoMode);
        if (this.shouldReconnect && !this.isDemoMode) {
          this.reconnectTimeout = setTimeout(() => {
            if (this.lastParams) {
              this.connect(this.lastParams.roomId, this.lastParams.name, this.lastParams.avatar);
            }
          }, 3000);
        }
      };
    } catch {
      this.startDemoMode(roomId, name, avatar);
    }
  }

  private handleIncomingMessage(msg: { type: string; [key: string]: unknown }) {
    switch (msg.type) {
      case 'ROOM_SYNC':
        this.currentRoom = msg.room as SquadRoomData;
        this.yourId = (msg.yourMemberId as string) || '';
        this.handlers.onRoomSync?.(this.currentRoom, this.yourId);
        break;

      case 'TIMER_STATE':
        if (this.currentRoom) {
          this.currentRoom.timer = msg.timer as SquadTimer;
        }
        this.handlers.onTimerState?.(msg.timer as SquadTimer);
        break;

      case 'TIMER_TICK':
        if (this.currentRoom && this.currentRoom.timer) {
          this.currentRoom.timer.secondsLeft = msg.secondsLeft as number;
        }
        this.handlers.onTimerTick?.(msg.secondsLeft as number);
        break;

      case 'TIMER_EXPIRED':
        if (this.currentRoom) {
          this.currentRoom.timer = msg.timer as SquadTimer;
        }
        this.handlers.onTimerExpired?.(msg.timer as SquadTimer);
        break;

      case 'MEMBER_JOINED':
        if (this.currentRoom) {
          const m = msg.member as SquadMember;
          this.currentRoom.members = [
            ...this.currentRoom.members.filter((x) => x.id !== m.id),
            m,
          ];
        }
        this.handlers.onMemberJoined?.(
          msg.member as SquadMember,
          msg.activity as SquadActivity
        );
        break;

      case 'MEMBER_UPDATED':
        if (this.currentRoom) {
          const updated = msg.member as SquadMember;
          this.currentRoom.members = this.currentRoom.members.map((m) =>
            m.id === updated.id ? { ...m, ...updated } : m
          );
        }
        this.handlers.onMemberUpdated?.(msg.member as SquadMember);
        break;

      case 'MEMBER_LEFT':
        if (this.currentRoom) {
          this.currentRoom.members = this.currentRoom.members.filter(
            (m) => m.id !== (msg.memberId as string)
          );
        }
        this.handlers.onMemberLeft?.(
          msg.memberId as string,
          msg.activity as SquadActivity
        );
        break;

      case 'ACTIVITY_LOG':
        if (this.currentRoom) {
          this.currentRoom.activities.push(msg.activity as SquadActivity);
        }
        this.handlers.onActivityLog?.(msg.activity as SquadActivity);
        break;

      case 'HYPE_REACTION':
        this.handlers.onHypeReaction?.(msg.reaction as HypeReaction);
        break;
    }
  }

  // Client commands
  public startTimer(seconds: number) {
    if (this.isDemoMode) {
      this.startDemoTimer(seconds);
      return;
    }
    this.send({ type: 'START_TIMER', seconds });
  }

  public adjustTimer(delta: number) {
    if (this.isDemoMode) {
      this.adjustDemoTimer(delta);
      return;
    }
    this.send({ type: 'ADJUST_TIMER', delta });
  }

  public stopTimer() {
    if (this.isDemoMode) {
      this.stopDemoTimer();
      return;
    }
    this.send({ type: 'STOP_TIMER' });
  }

  public updateStatus(status: 'LIFTING' | 'RESTING' | 'HYDRATING', exercise?: string) {
    if (this.isDemoMode) {
      this.updateDemoStatus(status, exercise);
      return;
    }
    this.send({ type: 'UPDATE_STATUS', status, exercise });
  }

  public logSet(exercise: string, weight: number, reps: number, unit = 'kg', autoRestSeconds = 90) {
    if (this.isDemoMode) {
      this.logDemoSet(exercise, weight, reps, unit, autoRestSeconds);
      return;
    }
    this.send({ type: 'LOG_SET', exercise, weight, reps, unit, autoRestSeconds });
  }

  public sendHypeReaction(emoji: string) {
    if (this.isDemoMode) {
      this.sendDemoHype(emoji);
      return;
    }
    this.send({ type: 'HYPE_REACTION', emoji });
  }

  public sendChat(text: string) {
    if (this.isDemoMode) {
      this.sendDemoChat(text);
      return;
    }
    this.send({ type: 'CHAT_MESSAGE', text });
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.cleanupDemo();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(obj: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  // ==========================================
  // Interactive Local Demo / Peer Bot Simulation
  // ==========================================
  private startDemoMode(roomId: string, name: string, avatar: string) {
    this.isDemoMode = true;
    this.yourId = 'usr-self-' + Math.random().toString(36).slice(2, 6);

    const presetBots: SquadMember[] = [
      {
        id: 'bot-elena',
        name: 'Elena (Iron Valkyrie)',
        avatar: '🛡️',
        currentExercise: 'Barbell Back Squat',
        status: 'LIFTING',
        lastSet: {
          exercise: 'Barbell Back Squat',
          weight: 100,
          reps: 8,
          unit: 'kg',
          timestamp: Date.now() - 45000,
        },
      },
      {
        id: 'bot-marcus',
        name: 'Marcus (Chest Beast)',
        avatar: '🦁',
        currentExercise: 'Incline Dumbbell Press',
        status: 'RESTING',
        lastSet: {
          exercise: 'Incline Dumbbell Press',
          weight: 38,
          reps: 10,
          unit: 'kg',
          timestamp: Date.now() - 20000,
        },
      },
      {
        id: 'bot-tariq',
        name: 'Tariq (Overhead Master)',
        avatar: '⚡',
        currentExercise: 'Military Overhead Press',
        status: 'HYDRATING',
        lastSet: {
          exercise: 'Military Overhead Press',
          weight: 65,
          reps: 6,
          unit: 'kg',
          timestamp: Date.now() - 80000,
        },
      },
    ];

    const youMember: SquadMember = {
      id: this.yourId,
      name: name || 'DriftLifter',
      avatar: avatar || '🔥',
      currentExercise: 'Flat Barbell Bench',
      status: 'LIFTING',
      lastSet: null,
    };

    this.currentRoom = {
      id: roomId,
      name:
        roomId === 'room-push-beasts'
          ? 'Heavy Push Syndicate 🔥'
          : roomId === 'room-leg-day-cult'
          ? 'Leg Day Survivors 💀'
          : 'Hypertrophy Lab 🧬',
      split: 'Push / Hypertrophy Cadence',
      description: 'Synchronized rest timers, real-time telemetry and hype reactions.',
      memberCount: 4,
      members: [youMember, ...presetBots],
      timer: {
        active: false,
        secondsLeft: 0,
        totalSeconds: 90,
        startedBy: null,
      },
      activities: [
        {
          id: 'act-init-1',
          sender: 'Squad Engine',
          text: 'Demo Peer Sync active. AI squad mates Marcus & Elena are lifting with you!',
          type: 'SYSTEM',
          timestamp: Date.now() - 100000,
        },
        {
          id: 'act-init-2',
          sender: 'Marcus (Chest Beast)',
          text: 'completed Incline Dumbbell Press · 38kg × 10 reps 🔥',
          type: 'SET_LOGGED',
          timestamp: Date.now() - 20000,
        },
      ],
    };

    this.handlers.onConnectionChange?.(true, true);
    this.handlers.onRoomSync?.(this.currentRoom, this.yourId);

    // Schedule autonomous bot behaviors
    this.initBotSimulation();
  }

  private initBotSimulation() {
    if (this.demoBotInterval) clearInterval(this.demoBotInterval);

    const botExercises = [
      { name: 'Elena (Iron Valkyrie)', botId: 'bot-elena', ex: 'Bulgarian Split Squats', wt: 24, reps: 10 },
      { name: 'Marcus (Chest Beast)', botId: 'bot-marcus', ex: 'Weighted Dips (+20kg)', wt: 20, reps: 8 },
      { name: 'Tariq (Overhead Master)', botId: 'bot-tariq', ex: 'Lateral Raises', wt: 14, reps: 15 },
      { name: 'Elena (Iron Valkyrie)', botId: 'bot-elena', ex: 'Romanian Deadlift', wt: 110, reps: 8 },
    ];

    let step = 0;
    this.demoBotInterval = setInterval(() => {
      if (!this.currentRoom) return;

      const action = botExercises[step % botExercises.length];
      step++;

      // Update bot member
      const member = this.currentRoom.members.find((m) => m.id === action.botId);
      if (member) {
        member.currentExercise = action.ex;
        member.status = 'RESTING';
        member.lastSet = {
          exercise: action.ex,
          weight: action.wt,
          reps: action.reps,
          unit: 'kg',
          timestamp: Date.now(),
        };

        const act: SquadActivity = {
          id: generateActivityId(),
          sender: member.name,
          text: `completed ${action.ex} · ${action.wt}kg × ${action.reps} reps 🔥`,
          type: 'SET_LOGGED',
          timestamp: Date.now(),
        };
        this.currentRoom.activities.push(act);

        this.handlers.onMemberUpdated?.(member);
        this.handlers.onActivityLog?.(act);

        // Occasional hype reaction from bot
        setTimeout(() => {
          const emojis = ['💪', '🔥', '⚡', '👏', '🦾'];
          const rx: HypeReaction = {
            id: `rx-${Date.now()}`,
            senderId: member.id,
            senderName: member.name,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            timestamp: Date.now(),
          };
          this.handlers.onHypeReaction?.(rx);
        }, 1500);
      }
    }, 28000);
  }

  private startDemoTimer(seconds: number) {
    if (!this.currentRoom) return;
    if (this.demoTimerInterval) clearInterval(this.demoTimerInterval);

    this.currentRoom.timer = {
      active: true,
      secondsLeft: seconds,
      totalSeconds: seconds,
      startedBy: this.currentRoom.members.find((m) => m.id === this.yourId)?.name || 'You',
    };

    const timerAct: SquadActivity = {
      id: generateActivityId(),
      sender: this.currentRoom.timer.startedBy || 'Squad',
      text: `Started ${seconds}s rest timer for the squad! ⏱️`,
      type: 'TIMER',
      timestamp: Date.now(),
    };
    this.currentRoom.activities.push(timerAct);

    this.handlers.onTimerState?.(this.currentRoom.timer);
    this.handlers.onActivityLog?.(timerAct);

    this.demoTimerInterval = setInterval(() => {
      if (!this.currentRoom || !this.currentRoom.timer.active) return;
      this.currentRoom.timer.secondsLeft -= 1;

      if (this.currentRoom.timer.secondsLeft <= 0) {
        this.currentRoom.timer.secondsLeft = 0;
        this.currentRoom.timer.active = false;
        if (this.demoTimerInterval) clearInterval(this.demoTimerInterval);

        const expAct: SquadActivity = {
          id: generateActivityId(),
          sender: 'Timer',
          text: 'Rest interval complete! Time to crush the next set! 💪⚡',
          type: 'TIMER',
          timestamp: Date.now(),
        };
        this.currentRoom.activities.push(expAct);

        this.handlers.onTimerExpired?.(this.currentRoom.timer);
        this.handlers.onActivityLog?.(expAct);
      } else {
        this.handlers.onTimerTick?.(this.currentRoom.timer.secondsLeft);
      }
    }, 1000);
  }

  private adjustDemoTimer(delta: number) {
    if (!this.currentRoom || !this.currentRoom.timer.active) return;
    this.currentRoom.timer.secondsLeft = Math.max(0, this.currentRoom.timer.secondsLeft + delta);
    this.currentRoom.timer.totalSeconds = Math.max(
      this.currentRoom.timer.totalSeconds,
      this.currentRoom.timer.secondsLeft
    );
    this.handlers.onTimerState?.(this.currentRoom.timer);
  }

  private stopDemoTimer() {
    if (!this.currentRoom) return;
    if (this.demoTimerInterval) clearInterval(this.demoTimerInterval);
    this.currentRoom.timer.active = false;
    this.currentRoom.timer.secondsLeft = 0;

    const stopAct: SquadActivity = {
      id: generateActivityId(),
      sender: this.currentRoom.members.find((m) => m.id === this.yourId)?.name || 'You',
      text: 'Rest timer skipped. Ready for action! ⚡',
      type: 'TIMER',
      timestamp: Date.now(),
    };
    this.currentRoom.activities.push(stopAct);

    this.handlers.onTimerState?.(this.currentRoom.timer);
    this.handlers.onActivityLog?.(stopAct);
  }

  private updateDemoStatus(status: 'LIFTING' | 'RESTING' | 'HYDRATING', exercise?: string) {
    if (!this.currentRoom) return;
    const member = this.currentRoom.members.find((m) => m.id === this.yourId);
    if (!member) return;
    member.status = status;
    if (exercise) member.currentExercise = exercise;
    this.handlers.onMemberUpdated?.(member);
  }

  private logDemoSet(
    exercise: string,
    weight: number,
    reps: number,
    unit: string,
    autoRestSeconds: number
  ) {
    if (!this.currentRoom) return;
    const member = this.currentRoom.members.find((m) => m.id === this.yourId);
    if (!member) return;

    member.currentExercise = exercise;
    member.status = 'RESTING';
    member.lastSet = {
      exercise,
      weight,
      reps,
      unit,
      timestamp: Date.now(),
    };

    const act: SquadActivity = {
      id: generateActivityId(),
      sender: member.name,
      text: `completed ${exercise} · ${weight}${unit} × ${reps} reps 🔥`,
      type: 'SET_LOGGED',
      timestamp: Date.now(),
    };
    this.currentRoom.activities.push(act);

    this.handlers.onMemberUpdated?.(member);
    this.handlers.onActivityLog?.(act);

    if (autoRestSeconds > 0) {
      this.startDemoTimer(autoRestSeconds);
    }

    // Bot companions send cheer reactions
    setTimeout(() => {
      const rx: HypeReaction = {
        id: `rx-${Date.now()}`,
        senderId: 'bot-marcus',
        senderName: 'Marcus (Chest Beast)',
        emoji: '🔥',
        timestamp: Date.now(),
      };
      this.handlers.onHypeReaction?.(rx);
    }, 1200);
  }

  private sendDemoHype(emoji: string) {
    if (!this.currentRoom) return;
    const member = this.currentRoom.members.find((m) => m.id === this.yourId);
    const rx: HypeReaction = {
      id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: this.yourId,
      senderName: member ? member.name : 'You',
      emoji,
      timestamp: Date.now(),
    };
    this.handlers.onHypeReaction?.(rx);
  }

  private sendDemoChat(text: string) {
    if (!this.currentRoom) return;
    const member = this.currentRoom.members.find((m) => m.id === this.yourId);
    const act: SquadActivity = {
      id: generateActivityId(),
      sender: member ? member.name : 'You',
      text,
      type: 'CHAT',
      timestamp: Date.now(),
    };
    this.currentRoom.activities.push(act);
    this.handlers.onActivityLog?.(act);
  }

  private cleanupDemo() {
    if (this.demoTimerInterval) {
      clearInterval(this.demoTimerInterval);
      this.demoTimerInterval = null;
    }
    if (this.demoBotInterval) {
      clearInterval(this.demoBotInterval);
      this.demoBotInterval = null;
    }
  }
}
