const WebSocket = require("ws");
const osc = require("osc");

// 1. 启动 WebSocket 服务器（前端连接）
const wss = new WebSocket.Server({ port: 12345 });

const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 57120,
});

udpPort.open();

wss.on("connection", function connection(ws) {
  console.log("✅ 前端 WebSocket 已连接");

  ws.on("message", function incoming(message) {
    console.log("🌐 收到前端数据:", message.toString());

    // 转发为 OSC 消息
    udpPort.send({
      address: "/playNote",
      args: [
        {
          type: "s",
          value: message.toString(), // JSON 字符串
        },
      ],
    });
  });
});
