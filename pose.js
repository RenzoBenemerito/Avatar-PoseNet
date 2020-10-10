const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;
const color = 'aqua';
const lineWidth = 2;

var mouseX = 0;
var mouseY = 0;
var particles = [];
var rightWristX = [];
var rightWristY = [];

var curr_element = "Fire"

var mid_point_x = videoWidth / 2;
var mid_point_y = videoHeight / 2;

var stop_earth = false;

var body_parts = {
    right_wrist: {
        key: 10,
        x: [],
        y: [],
        hit: false,
        connected_part: "right_elbow"
    },
    right_elbow: {
        key: 8,
        x: [],
        y: []
    },
    left_wrist: {
        key: 9,
        x: [],
        y: [],
        hit: false,
        connected_part: "left_elbow"
    },
    left_elbow: {
        key: 7,
        x: [],
        y: []
    },
    right_ankle: {
        key: 16,
        x: [],
        y: [],
        hit: false,
        connected_part: "right_knee"
    },
    right_knee: {
        key: 14,
        x: [],
        y: []
    },
    left_ankle: {
        key: 15,
        x: [],
        y: [],
        hit: false,
        connected_part: "left_elbow"
    },
    left_knee: {
        key: 13,
        x: [],
        y: []
    }
}


$('body').keypress(function (e) {
    if (String.fromCharCode(e.keyCode) == 'f'){
        curr_element = "Fire";
    }
    else if (String.fromCharCode(e.keyCode) == 'w'){
        curr_element = "Water";
    }
    else if (String.fromCharCode(e.keyCode) == 'a') {
        curr_element = "Air";
    }
    else if (String.fromCharCode(e.keyCode) == 'e') {
        curr_element = "Earth";
    }
    console.log(curr_element);
});

// Mdel Configuration
const poseNetState = {
    algorithm: 'single-pose',
    input: {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
        quantBytes: 2
    },
    singlePoseDetection: {
        minPoseConfidence: 0.2,
        minPartConfidence: 0.6,
    },
    output: {
        showVideo: true,
        showPoints: true,
    },
};

// We load the model.
const loadPoseNet = async () => {
    poseNetModel = await posenet.load({
        architecture: poseNetState.input.architecture,
        outputStride: poseNetState.input.outputStride,
        inputResolution: poseNetState.input.inputResolution,
        multiplier: poseNetState.input.multiplier,
        quantBytes: poseNetState.input.quantBytes
    });

    video = await loadVideo();

    detectPoseInRealTime(video);
};

function push_coordinates(keypoints, part){
    body_parts[part]["x"].push(keypoints[body_parts[part]["key"]]["position"]["x"]);
    body_parts[part]["y"].push(keypoints[body_parts[part]["key"]]["position"]["y"]);
    if (body_parts[part]["x"].length >= 5) {
        body_parts[part]["x"] = body_parts[part]["x"].slice(body_parts[part]["x"].length - 10, 10)
        body_parts[part]["y"] = body_parts[part]["y"].slice(body_parts[part]["y"].length - 10, 10)
    };
}

function average_points(part){
    x_avg_1 = computeAVG(body_parts[part]["x"], 3, 0);
    x_avg_2 = computeAVG(body_parts[part]["x"], 5, 2);

    y_avg_1 = computeAVG(body_parts[part]["y"], 3, 0);
    y_avg_2 = computeAVG(body_parts[part]["y"], 5, 2);

    var x = x_avg_1 - x_avg_2;
    var y = y_avg_1 - y_avg_2;

    var distance = Math.sqrt(x * x + y * y);
    if (distance > 70) {
        body_parts[part]["hit"] = true;
    }
    else{
        body_parts[part]["hit"] = false;
    }
}

function push_all_coordinates(keypoints){
    for (let part in body_parts) {
        push_coordinates(keypoints, part);
        if (["right_writs","left_wrist","right_ankle","left_ankle"].includes(part)){
            average_points(part);
        }
    }
}


function util_orient(part){
    if (body_parts[part]["x"][body_parts[part]["x"].length - 1] > body_parts[body_parts[part]["connected_part"]]["x"][body_parts[body_parts[part]["connected_part"]]["x"].length - 1]) {
        orient_x = true;
    }
    else {
        orient_x = false;
    }
    if (body_parts[part]["y"][body_parts[part]["y"].length - 1] > body_parts[body_parts[part]["connected_part"]]["y"][body_parts[body_parts[part]["connected_part"]]["y"].length - 1]) {
        orient_y = true;
    }
    else {
        orient_y = false;
    }
   
    return [orient_x, orient_y]
}

function computeAVG(arr,slice,i){
    var total = 0;
    for(;i<slice;i++){
        total += arr[i];
    }
    return total / arr.length;
}

function init_bending(){
    if (curr_element == "Fire") {
        bend_fire(body_parts["right_wrist"]["x"][body_parts["right_wrist"]["x"].length - 1], body_parts["right_wrist"]["y"][body_parts["right_wrist"]["y"].length - 1]);
        bend_fire(body_parts["left_wrist"]["x"][body_parts["left_wrist"]["x"].length - 1], body_parts["left_wrist"]["y"][body_parts["left_wrist"]["y"].length - 1]);
    }
    else if (curr_element == "Water") {
        bend_water(mid_point_x, mid_point_y + mid_point_y / 2);
        bend_water(mid_point_x - mid_point_x / 2, mid_point_y + mid_point_y / 4);
        bend_water(mid_point_x + mid_point_x / 2, mid_point_y + mid_point_y / 4);
    }
    else if (curr_element == "Earth") {
        if (stop_earth != true) {
            bend_earth(mid_point_x - mid_point_x / 2, mid_point_y - mid_point_y / 2);
            bend_earth(mid_point_x + mid_point_x / 2, mid_point_y - mid_point_y / 2);
            stop_earth = true;
        }
        
    }
}

function detectPoseInRealTime(video) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');
    const flipPoseHorizontal = true;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.globalCompositeOperation = "lighter";
    // init(canvas);
    //Update the mouse position
    // document.addEventListener("mousemove", function(e){
    //     getMousePos(e, canvas)}
    //     );

    //Update the particles every frame
    // var timer = setInterval(update(ctx), 40);

    async function poseDetectionFrame() {
        let poses = [];
        let minPoseConfidence;
        let minPartConfidence;

        switch (poseNetState.algorithm) {
            case 'single-pose':
                const pose = await poseNetModel.estimatePoses(video, {
                    flipHorizontal: flipPoseHorizontal,
                    decodingMethod: 'single-person'
                });
                poses = poses.concat(pose);
                minPoseConfidence = +poseNetState.singlePoseDetection.minPoseConfidence;
                minPartConfidence = +poseNetState.singlePoseDetection.minPartConfidence;
                break;
        }

        setInterval(ctx.clearRect(0, 0, videoWidth, videoHeight),100);

        if (curr_element == "Fire") {
            setInterval(update_element(ctx, "Fire"), 100);
        }
        else if (curr_element == "Water") {
            setInterval(update_element(ctx, "Water"), 100);
        }
        else if (curr_element == "Earth") {
            setInterval(update_element(ctx, "Earth"), 100);
        }
        else if (curr_element == "Air") {
            setInterval(update_element(ctx, "Air"), 100);
        }

        if (poseNetState.output.showVideo) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-videoWidth, 0);
            ctx.restore();
        }
        
        poses.forEach(({ score, keypoints }) => {
            if (score >= minPoseConfidence) {
                if (poseNetState.output.showPoints) {
                    // drawKeypoints(keypoints, minPartConfidence, ctx);
                    // drawSkeleton(keypoints, minPartConfidence, ctx, scale = 1);

                    push_all_coordinates(keypoints);

                    init_bending();

                    if (curr_element == "Earth") {
                        for (let part in body_parts) {
                            if (["right_writs", "left_wrist", "right_ankle", "left_ankle"].includes(part)) {
                                if ((body_parts[part]["x"][body_parts[part]["x"].length - 1] < mid_point_x - mid_point_x / 4 && body_parts[part]["x"][body_parts[part]["x"].length - 1] > mid_point_x - (3 * mid_point_x) / 4) && (body_parts[part]["y"][body_parts[part]["y"].length - 1] >= mid_point_y - mid_point_y / 4)) {
                                    generate_earth(mid_point_x, "left");
                                }
                                else if ((body_parts[part]["x"][body_parts[part]["x"].length - 1] < mid_point_x + (3 * mid_point_x) / 4 && body_parts[part]["x"][body_parts[part]["x"].length - 1] > mid_point_x + mid_point_x / 4) && (body_parts[part]["y"][body_parts[part]["y"].length - 1] >= mid_point_y - mid_point_y / 4)) {
                                    generate_earth(mid_point_x, "right");
                                }
                            }
                        }
                    }
                    else {
                        for (let part in body_parts) {
                            if (["right_writs", "left_wrist", "right_ankle", "left_ankle"].includes(part)) {
                                if (body_parts[part]["hit"]) {
                                    console.log(part + " hit!");
                                    if (curr_element == "Fire") {
                                        orient = util_orient(part);
                                        orient_x = orient[0]
                                        orient_y = orient[1]
                                        generate_fire(body_parts[part]["x"][body_parts[part]["x"].length - 1], body_parts[part]["y"][body_parts[part]["y"].length - 1], orient_x, orient_y);
                                    }
                                    else if (curr_element == "Water") {
                                        generate_water(mid_point_x, mid_point_y + mid_point_y / 2, "mid");
                                        generate_water(mid_point_x - mid_point_x / 2, mid_point_y + mid_point_y / 4, "left");
                                        generate_water(mid_point_x + mid_point_x / 2, mid_point_y + mid_point_y / 4, "right");
                                    }
                                    else if (curr_element == "Air") {
                                        orient_x = util_orient(part)[0];
                                        generate_air(orient_x);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
}

const loadVideo = async () => {
    const video = await setupCamera();
    video.play();
    return video;
};

const setupCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            "Browser API navigator.mediaDevices.getUserMedia not available"
        );
    }

    const video = document.getElementById("video");
    video.width = window.innerWidth;
    video.height = window.innerHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: window.innerWidth,
            height: window.innerHeight,
        },
    });
    video.srcObject = stream;

    return new Promise(
        (resolve) => (video.onloadedmetadata = () => resolve(video))
    );
};

loadVideo();
loadPoseNet();