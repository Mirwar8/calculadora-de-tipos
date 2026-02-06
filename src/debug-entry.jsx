
console.log('DEBUG SCRIPT LOADED');
const debugDiv = document.createElement('div');
debugDiv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:white;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;';
debugDiv.innerHTML = `
    <h1 style="color:blue;margin-bottom:20px;">Vite Execution Test</h1>
    <p style="font-size:1.2rem;color:black;">If you see this, the entry point script is working correctly.</p>
    <div style="margin-top:20px;padding:10px;border:1px solid #ccc;background:#eee;border-radius:4px;">
        <strong>Browser Info:</strong><br/>
        UserAgent: ${navigator.userAgent}<br/>
        URL: ${window.location.href}
    </div>
`;
document.body.appendChild(debugDiv);
window.DEBUG_WORKING = true;
console.log('DEBUG DIV APPENDED');
