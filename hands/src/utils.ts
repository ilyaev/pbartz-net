export const distance = (x1: number, y1: number, x2: number, y2: number) => {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

export const distance3d = (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
) => {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;
    const zDiff = z2 - z1;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
};

export const vectorSubtract = (a: number[], b: number[]) => {
    return a.map((v, i) => v - b[i]);
};

export const calculateAngleBetweenLines = (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    x3: number,
    y3: number,
    z3: number,
    x4: number,
    y4: number,
    z4: number
) => {
    // Calculate the vectors representing the lines
    const vector1 = {
        x: x2 - x1,
        y: y2 - y1,
        z: z2 - z1,
    };
    const vector2 = {
        x: x4 - x3,
        y: y4 - y3,
        z: z4 - z3,
    };

    console.log(vector1, vector2);

    // Calculate the dot product of the vectors
    const dotProduct =
        vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;

    // Calculate the magnitudes of the vectors
    const magnitude1 = Math.sqrt(
        vector1.x * vector1.x + vector1.y * vector1.y + vector1.z * vector1.z
    );
    const magnitude2 = Math.sqrt(
        vector2.x * vector2.x + vector2.y * vector2.y + vector2.z * vector2.z
    );

    // Calculate the angle using the dot product formula
    const angleInRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));

    // Convert the angle to degrees
    const angleInDegrees = angleInRadians * (180 / Math.PI);

    return angleInDegrees;
};

export function clickElementByCoordinates(x: number, y: number) {
    // Get the element at the specified coordinates.
    let element = document.elementFromPoint(x, y);

    // If the element is a canvas, keep searching for elements behind it
    while (element && element.tagName.toLowerCase() === "canvas") {
        element = element.parentElement;
    }

    // Create a mouse event to simulate a click.
    const clickEvent = new MouseEvent("click", {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
    });

    // Dispatch the click event on the element.
    if (element) {
        element.dispatchEvent(clickEvent);
    } else {
        console.error(`No element found at coordinates: ${x}, ${y}`);
    }
}
