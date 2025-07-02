import { ipcRenderer, contextBridge } from 'electron'
import schedule from 'node-schedule'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

contextBridge.exposeInMainWorld('schedule', {
  scheduleJob: (...args: Parameters<typeof schedule.scheduleJob>) => {
    const [spec, ...omit] = args
    return schedule.scheduleJob(spec, ...omit)
  },
  rescheduleJob: (...args: Parameters<typeof schedule.rescheduleJob>) => {
    const [job, spec] = args
    return schedule.rescheduleJob(job, spec)
  },
  cancelJob: (...args: Parameters<typeof schedule.cancelJob>) => {
    const [job] = args
    return schedule.cancelJob(job)
  },
})
