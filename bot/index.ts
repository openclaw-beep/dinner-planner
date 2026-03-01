import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import chrono from 'chrono-node';

const TRIGGER_PATTERNS = [
  /\bplan dinner\b/i,
  /\bplan dinner for\b/i,
  /\blet'?s plan dinner\b/i
];

function getMessageText(message: any): string {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    ''
  );
}

function isPlanDinnerTrigger(text: string): boolean {
  return TRIGGER_PATTERNS.some((pattern) => pattern.test(text));
}

function buildResponse(text: string): string {
  const maybeDate = chrono.parseDate(text);

  if (maybeDate) {
    return `Great! I picked up a possible time: ${maybeDate.toLocaleString()}. When works for everyone?`;
  }

  return 'Great! When works for everyone? Reply with date/time ideas like "Friday 7pm" or "next Tuesday evening".';
}

async function startBot(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('.auth');
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('Dinner Planner bot connected to WhatsApp.');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`WhatsApp connection closed. Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) {
        void startBot();
      }
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') {
      return;
    }

    for (const msg of messages) {
      if (!msg.key.remoteJid || msg.key.fromMe || !msg.message) {
        continue;
      }

      const text = getMessageText(msg.message).trim();
      if (!text || !isPlanDinnerTrigger(text)) {
        continue;
      }

      const response = buildResponse(text);
      await socket.sendMessage(msg.key.remoteJid, { text: response });
    }
  });
}

void startBot().catch((error) => {
  console.error('Failed to start Dinner Planner bot:', error);
  process.exit(1);
});
