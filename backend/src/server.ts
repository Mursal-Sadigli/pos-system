import { httpServer } from './socket/index';

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🔐 POS System Backend');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔑 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});