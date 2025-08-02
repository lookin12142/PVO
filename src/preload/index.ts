import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  productos: {
    obtener: () => ipcRenderer.invoke('productos:obtener'),
    buscar: (termino: string) => ipcRenderer.invoke('productos:buscar', termino),
    obtenerPorCodigo: (codigo: string) => ipcRenderer.invoke('productos:obtenerPorCodigo', codigo),
    crear: (datos: any) => ipcRenderer.invoke('productos:crear', datos),
    actualizar: (id: string, datos: any) => ipcRenderer.invoke('productos:actualizar', id, datos)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the global window object.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}