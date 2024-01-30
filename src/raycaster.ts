export function raycaster(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");

    let imageData = ctx?.createImageData(canvas.width, canvas.height);

    const internalCanvasWidth = canvas.width;

    const halfCanvasHeight = canvas.height / 2;
    const imageDataWidth4 = canvas.width*4;

    const keyState: { [key: string]: boolean } = {};

    const FOV = Math.PI / 4.0;
    const DEPTH = 16.0;
    const MOVE_SPEED = 0.1;
    const STRAFE_SPEED = 0.05;
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

    // const map1 = [
    //     "################",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "#              #",
    //     "################"
    // ]; 

    const map = map0

    const mapHeight = map.length;
    const mapWidth = map[0].length;

    let playerPosX = Math.floor(mapWidth/2);
    let playerPosY = Math.floor(mapWidth/2);
    let playerAngle = 0;

    canvas.onclick = function() {
        canvas.requestPointerLock();
    }

    window.addEventListener("keydown", (event) => {
        keyState[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        keyState[event.key] = false;
    });

    window.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === canvas) {
            playerAngle += event.movementX * 0.001;
        }
    });

    function step() {
        handleKeydown()
        const data: number[] = []

        for (let i = 0; i < internalCanvasWidth; ++i) {
            let rayAngle = (playerAngle - FOV / 2) + (i / internalCanvasWidth) * FOV;
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
    
            for (let j = 0; j < canvas.height; ++j) {
                if (j < ceiling) {
                    data.push(FOG);
                }
                else if (j > ceiling && j <= floor) {
                    const wallShade = Math.max(FOG, 150 - Math.floor((distanceToWall/16) * 150));
                    data.push(wallShade);
                }
                else {
                    const floorShade = Math.max(50, Math.sin((j - halfCanvasHeight) / halfCanvasHeight * Math.PI / 2) * 255);
                    data.push(floorShade);
                }
            }
        }

        const downsampled_data = downsample(data, 1);

        for (let k = 0; k < downsampled_data.length; k++) {
            let i = k % canvas.width;
            let j = Math.floor(k / canvas.width);
            pushImageData(i, j, downsampled_data[k], downsampled_data[k], downsampled_data[k])
        }
    
        if (imageData && ctx) {
            ctx.putImageData(imageData, 0, 0);
        }

        window.requestAnimationFrame(step)
    }

    function downsample(data: number[], size: number) : number[] {
        const downsampled_data = []
        for (let i = 0; i < data.length; i+=size) {
            let avg = 0;
            for (let j = 0; j < size; j++) {
                avg += data[j]
            }
            downsampled_data.push(avg/size)
        }

        return downsampled_data
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
            playerPosX -= Math.cos(playerAngle) * STRAFE_SPEED;
            playerPosY += Math.sin(playerAngle) * STRAFE_SPEED;

            if (map[Math.floor(playerPosY)][Math.floor(playerPosX)] == "#") {
                playerPosX += Math.cos(playerAngle) * STRAFE_SPEED;
                playerPosY -= Math.sin(playerAngle) * STRAFE_SPEED;
            }
        }
        else if (keyState["d"]) {
            playerPosX += Math.cos(playerAngle) * STRAFE_SPEED;
            playerPosY -= Math.sin(playerAngle) * STRAFE_SPEED;

            if (map[Math.floor(playerPosY)][Math.floor(playerPosX)] == "#") {
                playerPosX -= Math.cos(playerAngle) * STRAFE_SPEED;
                playerPosY += Math.sin(playerAngle) * STRAFE_SPEED;
            }
        }
        if (keyState["w"]) {
            playerPosX += Math.sin(playerAngle) * MOVE_SPEED;
            playerPosY += Math.cos(playerAngle) * MOVE_SPEED;

            if (map[Math.floor(playerPosY)][Math.floor(playerPosX)] == "#") {
                playerPosX -= Math.sin(playerAngle) * MOVE_SPEED;
                playerPosY -= Math.cos(playerAngle) * MOVE_SPEED;
            }
        }
        else if (keyState["s"]) {
            playerPosX -= Math.sin(playerAngle) * MOVE_SPEED;
            playerPosY -= Math.cos(playerAngle) * MOVE_SPEED;

            if (map[Math.floor(playerPosY)][Math.floor(playerPosX)] == "#") {
                playerPosX += Math.sin(playerAngle) * MOVE_SPEED;
                playerPosY += Math.cos(playerAngle) * MOVE_SPEED;
            }
        }
    }

    window.requestAnimationFrame(step)
  }