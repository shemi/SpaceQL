export function getTargetScrollLocationY(target, parent) {
    let targetPosition = target.getBoundingClientRect(),
        parentPosition = parent.getBoundingClientRect(),
        y,
        differenceY,
        targetHeight = targetPosition.height,
        topOffset = 0,
        isTopOut = ((targetPosition.top - parentPosition.top) < 0),
        isBottomOut = (targetPosition.bottom > (parentPosition.height + parentPosition.top)),
        topScalar = isTopOut ? 0 : 1,
        isOut = isTopOut || isBottomOut;

    let offsetTop = targetPosition.top - (parentPosition.top - parent.scrollTop);

    y = offsetTop + (targetHeight * topScalar) - parent.clientHeight * topScalar;
    y = Math.max(Math.min(y, parent.scrollHeight - parent.clientHeight), 0);
    y -= topOffset;
    differenceY = y - parent.scrollTop;

    return {
        isOut,
        y,
        differenceY
    };
}

export function getTargetScrollLocationX(target, parent, align) {
    let targetPosition = target.getBoundingClientRect(),
        parentPosition = parent.getBoundingClientRect(),
        x,
        differenceX,
        targetWidth = targetPosition.width,
        leftAlign = align && align.left != null ? align.left : 0.5,
        leftOffset = align && align.leftOffset != null ? align.leftOffset : 0,
        leftScalar = leftAlign,
        isOut = ((targetPosition.left - parentPosition.left) < 0) || (targetPosition.right > parentPosition.right);

    let offsetLeft = targetPosition.left - (parentPosition.left - parent.scrollLeft);

    x = offsetLeft + (targetWidth * leftScalar) - parent.clientWidth * leftScalar;
    x = Math.max(Math.min(x, parent.scrollWidth - parent.clientWidth), 0);
    x -= leftOffset;
    differenceX = x - parent.scrollLeft;

    return {
        isOut,
        x,
        differenceX,
    };
}