/* ==========================================================================
   SoloDev Studio — desktop preload
   Exposes a tiny, read-only view of the desktop shell to the app, plus one
   action: asking it to switch rendering mode and restart. Nothing else.
   ========================================================================== */
const { contextBridge, ipcRenderer } = require('electron');

function argValue(name) {
  for (let i = 0; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.indexOf('--' + name + '=') === 0) return a.slice(name.length + 3);
  }
  return null;
}

contextBridge.exposeInMainWorld('solodevDesktop', {
  isDesktop: true,
  softwareRendering: argValue('solodev-software') === '1',
  status: function () { return ipcRenderer.invoke('solodev:get-status'); },
  setSoftwareRendering: function (on) { return ipcRenderer.invoke('solodev:set-software', !!on); }
});
