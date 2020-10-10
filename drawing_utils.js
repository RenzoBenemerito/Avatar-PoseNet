function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }

        const { y, x } = keypoint.position;
        drawPoint(ctx, y * scale, x * scale, 5, color);
    }
}

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSegment(ctx, [ay, ax], [by, bx], color, scale, ) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function toTuple({ y, x }) {
    return [y, x];
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints =
        posenet.getAdjacentKeyPoints(keypoints, minConfidence);

    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(
            ctx,
            toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
            scale);
    });
}