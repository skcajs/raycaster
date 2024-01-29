import './style.css'
import { raycaster } from './raycaster.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="card">
      <canvas id="canvas" width='1024' height='768'></canvas>
    </div>
  </div>
`

raycaster(document.querySelector<HTMLCanvasElement>('#canvas')!)
