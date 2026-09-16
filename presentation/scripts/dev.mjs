import net from 'node:net'
import { spawn } from 'node:child_process'

const probe = net.createServer()
probe.once('error', () => {
  console.error('A porta 3031 está ocupada. Encerre somente a prévia anterior deste piloto antes de iniciar outra.')
  process.exitCode = 1
})
probe.listen(3031, '127.0.0.1', () => probe.close(() => {
  const child = spawn('slidev', ['--port', '3031'], { stdio: 'inherit' })
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
  child.on('exit', code => { process.exitCode = code ?? 0 })
}))
