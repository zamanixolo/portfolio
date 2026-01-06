import puppeteer from 'puppeteer';
import { spawn, ChildProcess } from 'child_process';
import { rm } from 'fs/promises';
import path from 'path';
import http from 'http';

let serverProcess: ChildProcess | null = null;
let browser: any = null;
let isRepairing = false;
let isChecking = false;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
    if (serverProcess) return;
    
    console.log('🚀 Starting Next.js dev server...');
    serverProcess = spawn('npm', ['run', 'dev'], { 
        stdio: 'inherit', 
        shell: true,
        detached: false 
    });

    serverProcess.on('exit', (code) => {
        if (!isRepairing) {
            console.log(`Server exited with code ${code}`);
            process.exit(code || 0);
        }
    });

    console.log('Waiting for server to be ready...');
    await sleep(5000); 
}

async function stopServer() {
    if (serverProcess) {
        console.log('🛑 Stopping server...');
        serverProcess.kill('SIGINT');
        await sleep(2000);
        serverProcess = null;
    }
}

async function repair() {
    if (isRepairing) return;
    isRepairing = true;
    
    console.log('\n🔧 ACTION REQUIRED: Critical error detected.');
    console.log('🔄 Initiating self-healing sequence...');

    await stopServer();
    
    console.log('🧹 Clearing .next cache...');
    try {
        await rm(path.join(process.cwd(), '.next'), { recursive: true, force: true });
    } catch (e) {
        console.error('Failed to clear cache:', e);
    }

    console.log('♻️ Restarting server...');
    await startServer();
    
    isRepairing = false;
    console.log('✅ Repair complete. System healthy.\n');
}

async function checkHealth() {
    if (isRepairing || isChecking) return;
    isChecking = true;

    if (!browser) {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
    }

    let page;
    try {
        page = await browser.newPage();
        await page.setUserAgent('Portfolio-Monitor-Bot');
    } catch (e) {
        console.error('Failed to create page:', e);
        isChecking = false;
        return;
    }

    let errorDetected = false;
    const errorLogs: string[] = [];

    page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (text.includes('Internal Server Error') || 
                text.includes('negative time stamp') || 
                text.includes('Hydration failed') ||
                text.includes('Runtime TypeError')) {
                errorLogs.push(text);
                errorDetected = true;
            }
        }
    });

    page.on('pageerror', (err: any) => {
        const text = err.toString();
        if (text.includes('Internal Server Error') || 
            text.includes('negative time stamp')) {
            errorLogs.push(text);
            errorDetected = true;
        }
    });

    try {
        const response = await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle0',
            timeout: 8000 
        });

        if (response && response.status() >= 500) {
            errorLogs.push(`HTTP Status ${response.status()}`);
            errorDetected = true;
        }
    } catch (e: any) {
        if (!e.message.includes('ERR_CONNECTION_REFUSED')) {
            // console.log('Navigation warning:', e.message);
        }
    }

    await page.close();

    if (errorDetected) {
        console.log('❌ Errors detected on page reload:');
        errorLogs.forEach(e => console.log(`   - ${e}`));
        await repair();
    } else {
        console.log('✅ Health check passed.');
    }
    
    isChecking = false;
}

function startTriggerServer() {
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        
        if (req.url === '/notify') {
            console.log('🔔 Page load detected. Running health check...');
            // Add slight delay to allow page to actually crash if it's going to
            setTimeout(() => checkHealth(), 1000);
            res.writeHead(200);
            res.end('ok');
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    
    server.listen(3001, () => {
        console.log('👂 Monitor listening on port 3001 for page reloads...');
    });
    
    return server;
}

async function main() {
    startTriggerServer();
    await startServer();
    
    console.log('ready');
}

process.on('SIGINT', async () => {
    console.log('Exiting monitor...');
    if (browser) await browser.close();
    await stopServer();
    process.exit();
});

main();