const dns = require('dns').promises;
const net = require('net');

async function testResolution(host) {
  try {
    const addresses = await dns.resolve(host);
    console.log(`✅ DNS resolved ${host} successfully:`, addresses);
    return { success: true, addresses };
  } catch (err) {
    console.log(`❌ DNS failed to resolve ${host}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function testSrvResolution(host) {
  try {
    const addresses = await dns.resolveSrv('_mongodb._tcp.' + host);
    console.log(`✅ SRV DNS resolved successfully for ${host}:`, addresses.map(a => `${a.name}:${a.port}`));
    return { success: true, addresses };
  } catch (err) {
    console.log(`❌ SRV DNS failed to resolve for ${host}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function testPort(host, port = 27017) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    
    console.log(`Connecting to ${host}:${port}...`);
    
    socket.connect(port, host, () => {
      console.log(`✅ TCP port connection to ${host}:${port} SUCCEEDED!`);
      socket.destroy();
      resolve(true);
    });

    socket.on('error', (err) => {
      console.log(`❌ TCP port connection to ${host}:${port} FAILED:`, err.message);
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      console.log(`❌ TCP port connection to ${host}:${port} TIMED OUT.`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function run() {
  console.log('==================================================');
  console.log('       MONGODB ATLAS DNS & CONNECTION DIAGNOSTIC   ');
  console.log('==================================================\n');

  console.log('Step 1: Checking internet connection...');
  const internet = await testResolution('google.com');
  if (!internet.success) {
    console.log('\n🚨 DIAGNOSIS: You are not connected to the internet, or your local DNS is completely offline.');
    console.log('👉 ACTION: Please check your Wi-Fi, Ethernet, or local internet connection.');
    return;
  }

  console.log('\nStep 2: Resolving MongoDB Atlas SRV record...');
  const atlasSrv = await testSrvResolution('cluster0.bubjmca.mongodb.net');

  console.log('\nStep 3: Resolving MongoDB Shard Domain...');
  const shardName = 'ac-czna6ah-shard-00-02.bubjmca.mongodb.net';
  const shardDns = await testResolution(shardName);

  if (!shardDns.success) {
    console.log('\n🚨 DIAGNOSIS: DNS lookup failed specifically for MongoDB Atlas nodes.');
    console.log('This is very common when local ISP DNS servers fail to resolve MongoDB Atlas domains.');
    console.log('👉 ACTION:');
    console.log('  1. Switch your local network DNS server to Google DNS (8.8.8.8 / 8.8.4.4) or Cloudflare DNS (1.1.1.1).');
    console.log('  2. Flush your local DNS cache by running this command in a new PowerShell / Command Prompt as Admin:');
    console.log('     ipconfig /flushdns');
    console.log('  3. If you are using a VPN or office firewall, try disabling it or changing networks.');
    return;
  }

  console.log('\nStep 4: Testing TCP connection to MongoDB Atlas node (Port 27017)...');
  const portSuccess = await testPort(shardName, 27017);

  if (!portSuccess) {
    console.log('\n🚨 DIAGNOSIS: DNS resolves successfully, but the TCP port (27017) is blocked.');
    console.log('👉 ACTION:');
    console.log('  1. Check if a firewall or antivirus is blocking outgoing traffic on port 27017.');
    console.log('  2. Ensure your IP address is whitelisted in your MongoDB Atlas Network Access rules.');
    console.log('  3. If you are on a public/office network, port 27017 might be blocked by the network administrator.');
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Your internet, DNS, and port access to MongoDB Atlas are working perfectly.');
    console.log('If you still see errors, try restarting the backend server with `npm run dev`.');
  }
}

run();
