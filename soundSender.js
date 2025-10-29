let socket = null;

export function initWebSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("✅ WebSocket already connected");
    return;
  }

  socket = new WebSocket("ws://localhost:12345"); // 或者换成你的端口

  socket.onopen = () => {
    console.log("✅ Connected to SuperCollider WebSocket");
  };

  socket.onerror = (e) => {
    console.error("❌ WebSocket error:", e);
  };

  socket.onclose = () => {
    console.warn("⚠️ WebSocket closed, will retry...");
    setTimeout(initWebSocket, 1000);
  };
}

export function sendToSC(mode, notes) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("⚠️ WebSocket not ready, reinitializing...");
    initWebSocket();
    return;
  }

  const payload = { mode, notes };
  socket.send(JSON.stringify(payload));
}
