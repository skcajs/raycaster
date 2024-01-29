export function raycaster(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");

    let imageData = ctx?.createImageData(canvas.width, canvas.height)

    const halfCanvasHeight = canvas.height / 2;
    const imageDataWidth4 = canvas.width*4;

    const keyState: { [key: string]: boolean } = {};

    const FOV = Math.PI / 4.0;
    const DEPTH = 16.0;
    const MOVE_ANGLE = 0.025;
    const MOVE_POS = 0.1;
    const FOG = 50;

    const map0 = [
        "################",
        "#           #  #",
        "## ##       ## #",
        "## #           #",
        "#  #####   #####",
        "#  #           #",
        "# ##           #",
        "#              #",
        "#              #",
        "########       #",
        "###  ###       #",
        "#      #       #",
        "###  ###   ##  #",
        "###  ###   ##  #",
        "#              #",
        "################"
    ];

    const map1 = [
        "################",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "#              #",
        "################"
    ];

    const map2 = [
        "################################",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "#                              #",
        "################################"
    ];           

    const map = map0

    const mapHeight = map.length;
    const mapWidth = map[0].length;

    let playerPosX = Math.floor(mapWidth/2);
    let playerPosY = Math.floor(mapWidth/2);
    let playerAngle = 0;

    window.addEventListener("keydown", (event) => {
        keyState[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        keyState[event.key] = false;
    });

    window.addEventListener("mousemove", (event) => {
        playerAngle += event.movementX * 0.005;
    });

    function step() {
        handleKeydown()
        for (let i = 0; i < canvas.width; ++i) {
            let rayAngle = (playerAngle - FOV / 2) + (i / canvas.width) * FOV;
            let distanceToWall = 0;
            let hitWall = false;
            let eyeX = Math.sin(rayAngle);
            let eyeY = Math.cos(rayAngle);
    
            while (!hitWall) {
                distanceToWall += 0.1;
    
                const testX = Math.floor(playerPosX + eyeX * distanceToWall);
                const testY = Math.floor(playerPosY + eyeY * distanceToWall);
    
                if (testX < 0 || testX > mapWidth || testY < 0 || testY > mapHeight) {
                    hitWall = true;
                    distanceToWall = DEPTH;
                }
    
                else if(map[testY][testX] == "#") {
                    hitWall = true;
                }
            }
    
            const ceiling = Math.floor((halfCanvasHeight) - (canvas.height / distanceToWall));
            const floor = canvas.height - ceiling;

            const wallShade = Math.max(FOG, 150 - Math.floor((distanceToWall/16) * 150));
    
            for (let j = 0; j < canvas.height; ++j) {
                if (j < ceiling) {
                    pushImageData(i, j, FOG, FOG, FOG);
                }
                else if (j > ceiling && j <= floor) {
                    pushImageData(i, j, wallShade, wallShade, wallShade);
                }
                else {
                    const floorShade = Math.max(50, Math.sin((j - halfCanvasHeight) / halfCanvasHeight * Math.PI / 2) * 255);
                    pushImageData(i, j, floorShade, floorShade, floorShade);
                }
            }
        }
    
        if (imageData && ctx) {
            ctx.putImageData(imageData, 0, 0);
        }

        window.requestAnimationFrame(step)
    }

    function pushImageData(i: number, j: number, r: number, g: number, b: number, a: number = 255) {
        if (imageData) {
            imageData.data[j*(imageDataWidth4) + (i*4) + 0] = r;
            imageData.data[j*(imageDataWidth4) + (i*4) + 1] = g;
            imageData.data[j*(imageDataWidth4) + (i*4) + 2] = b;
            imageData.data[j*(imageDataWidth4) + (i*4) + 3] = a;
        }
    }

    function handleKeydown() {
        if (keyState["a"]) {
            playerAngle -= MOVE_ANGLE;
        }
        else if (keyState["d"]) {
            playerAngle += MOVE_ANGLE;
        }
        if (keyState["w"]) {
            playerPosX += Math.sin(playerAngle) * MOVE_POS;
            playerPosY += Math.cos(playerAngle) * MOVE_POS;

            if (map[Math.floor(playerPosY)][Math.floor(playerPosX)] == "#") {
                playerPosX -= Math.sin(playerAngle) * MOVE_POS;
                playerPosY -= Math.cos(playerAngle) * MOVE_POS;
            }
        }
        else if (keyState["s"]) {
            playerPosX -= Math.sin(playerAngle) * MOVE_POS;
            playerPosY -= Math.cos(playerAngle) * MOVE_POS;

            if (map[Math.floor(playerPosY)][Math.floor(playerPosX)] == "#") {
                playerPosX += Math.sin(playerAngle) * MOVE_POS;
                playerPosY += Math.cos(playerAngle) * MOVE_POS;
            }
        }
    }

    window.requestAnimationFrame(step)
  }